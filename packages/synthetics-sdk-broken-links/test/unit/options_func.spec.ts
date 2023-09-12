// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { expect } from 'chai';
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  BrokenLinkCheckerOptions,
  StatusClass,
  LinkOrder,
} from '../../src/broken_links';
import {
  setDefaultOptions,
  validateInputOptions,
} from '../../src/options_func';

describe('GCM Synthetics Broken Links  options_func suite testing', () => {
  const status_value_304: ResponseStatusCode = { status_value: 304 };
  const status_class_2xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  const status_class_3xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_3XX,
  };
  const status_class_4xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_4XX,
  };
  it('setDefaultOptions only sets non-present values', () => {
    const input_options: BrokenLinkCheckerOptions = {
      origin_url: 'https://example.com',
      get_attributes: ['src'],
      link_order: LinkOrder.RANDOM,
      link_timeout_millis: 5000,
      wait_for_selector: '.content',
      per_link_options: {
        'fake-link1': { expected_status_code: StatusClass.STATUS_CLASS_4XX },
        'fake-link2': { expected_status_code: 304 },
        'fake-link3': { link_timeout_millis: 10 },
        'fake-link4': {
          expected_status_code: StatusClass.STATUS_CLASS_3XX,
          link_timeout_millis: 10,
        },
      },
    };
    const options = setDefaultOptions(input_options);

    // Verify that missing values are set to their default values
    expect(options.link_limit).to.equal(50);
    expect(options.query_selector_all).to.equal('a');
    expect(options.max_retries).to.equal(0);
    expect(options.max_redirects).to.equal(Number.MAX_SAFE_INTEGER);

    // Verify that existing values are not overridden
    expect(options.origin_url).to.equal('https://example.com');
    expect(options.get_attributes).to.deep.equal(['src']);
    expect(options.link_order).to.equal(
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM
    );
    expect(options.link_timeout_millis).to.equal(5000);
    expect(options.wait_for_selector).to.equal('.content');

    const link_options = {
      'fake-link1': {
        expected_status_code: status_class_4xx,
        link_timeout_millis: 5000,
      },
      'fake-link2': {
        expected_status_code: status_value_304,
        link_timeout_millis: 5000,
      },
      'fake-link3': {
        expected_status_code: status_class_2xx,
        link_timeout_millis: 10,
      },
      'fake-link4': {
        expected_status_code: status_class_3xx,
        link_timeout_millis: 10,
      },
    };
    expect(options.per_link_options).to.deep.equal(link_options);
  });

  describe('validateInputOptions', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    it('throws error if origin_url is missing', () => {
      const options = {} as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'Missing origin_url in options');
    });
    it('throws error if origin_url is not a string', () => {
      const options = { origin_url: 4 } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'origin_url must be a string that starts with `http`');
    });
    it('throws error if origin_url does not start with http', () => {
      const options = { origin_url: 'blah' } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'origin_url must be a string that starts with `http`');
    });
    it('throws error if link_limit is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        link_limit: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_limit value, must be a number greater than 0'
      );
    });
    it('throws error if link_limit is less than 1', () => {
      const options = {
        origin_url: 'http://example.com',
        link_limit: 0,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_limit value, must be a number greater than 0'
      );
    });
    it('throws error if query_selector_all is not a string', () => {
      const options = {
        origin_url: 'http://example.com',
        query_selector_all: 123,
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid query_selector_all value, must be a non-empty string'
      );
    });
    it('throws error if query_selector_all is an empty string', () => {
      const options = {
        origin_url: 'http://example.com',
        query_selector_all: '',
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid query_selector_all value, must be a non-empty string'
      );
    });
    it('throws error if get_attributes is not an array of strings', () => {
      const options = {
        origin_url: 'http://example.com',
        get_attributes: ['href', 123],
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid get_attributes value, must be an array of only strings'
      );
    });
    it('throws error if link_order is not a valid LinkOrder value', () => {
      const options = {
        origin_url: 'http://example.com',
        link_order: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_order value, must be `FIRST_N` or `RANDOM`'
      );
    });
    it('link_order accepts string', () => {
      const options = {
        origin_url: 'http://example.com',
        link_order: 'RANDOM',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.not.throw();
    });
    it('throws error if link_timeout_millis is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        link_timeout_millis: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_timeout_millis value, must be a number greater than 0'
      );
    });
    it('throws error if link_timeout_millis is less than 1', () => {
      const options = {
        origin_url: 'http://example.com',
        link_timeout_millis: 0,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_timeout_millis value, must be a number greater than 0'
      );
    });
    it('throws error if max_retries is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        max_retries: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid max_retries value, must be a number greater than -1'
      );
    });
    it('throws error if max_retries is less than -1', () => {
      const options = {
        origin_url: 'http://example.com',
        max_retries: -2,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid max_retries value, must be a number greater than -1'
      );
    });
    it('throws error if max_redirects is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        max_redirects: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'Invalid max_redirects');
    });
    it('throws error if max_redirects is less than -1', () => {
      const options = {
        origin_url: 'http://example.com',
        max_redirects: -2,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid max_redirects value, must be a number greater than -1'
      );
    });
    it('throws error if wait_for_selector is not a string', () => {
      const options = {
        origin_url: 'http://example.com',
        wait_for_selector: 123,
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid wait_for_selector value, must be a non-empty string'
      );
    });
    it('throws error if wait_for_selector is an empty string', () => {
      const options = {
        origin_url: 'http://example.com',
        wait_for_selector: '',
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid wait_for_selector value, must be a non-empty string'
      );
    });
    it('throws error if per_link_options contains an invalid URL', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'invalid-url': {
            link_timeout_millis: 5000,
          },
        },
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid url in per_link_options, urls must start with `http`'
      );
    });
    it('throws error if per_link_options contains an invalid link_timeout_millis value', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            link_timeout_millis: -1,
          },
        },
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_timeout_millis value in per_link_options set for http://example.com, must be a number greater than 0'
      );
    });
    it('throws error if per_link_options contains an invalid expected_status_code number', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            expected_status_code: 50,
          },
        },
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid expected_status_code in per_link_options for http://example.com, must be a number between 100 and 599 (inclusive) or a string present in StatusClass enum'
      );
    });
    it('throws error if per_link_options contains an invalid expected_status_code string', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            expected_status_code: 'STATUS_CLASS_WOOHOO',
          },
        },
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid expected_status_code in per_link_options for http://example.com, must be a number between 100 and 599 (inclusive) or a string present in StatusClass enum'
      );
    });
    it('per_link_options accepts valid string as StatusClass', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            expected_status_code: 'STATUS_CLASS_4XX',
          },
        },
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.not.throw();
    });
    it('validates input options when all values are valid', () => {
      const options = {
        origin_url: 'http://example.com',
        link_limit: 10,
        query_selector_all: 'a',
        get_attributes: ['href'],
        link_order: LinkOrder.FIRST_N,
        link_timeout_millis: 5000,
        max_retries: 3,
        max_redirects: 5,
        wait_for_selector: 'a.link',
        per_link_options: {
          'http://example.com': {
            link_timeout_millis: 3000,
            expected_status_code: StatusClass.STATUS_CLASS_2XX,
          },
        },
      } as BrokenLinkCheckerOptions;

      expect(() => {
        validateInputOptions(options);
      }).not.to.throw();
    });
    it('validates input options and gets rid of extra fields', () => {
      const options = {
        origin_url: 'http://example.com',
        fake_field: 'hello',
      } as any as BrokenLinkCheckerOptions;

      const expectations = {
        origin_url: 'http://example.com',
        link_limit: undefined,
        query_selector_all: undefined,
        get_attributes: undefined,
        link_order: undefined,
        link_timeout_millis: undefined,
        max_retries: undefined,
        max_redirects: undefined,
        wait_for_selector: undefined,
        per_link_options: undefined,
      } as BrokenLinkCheckerOptions;

      expect(() => {
        validateInputOptions(options);
      }).not.to.throw();
      expect(validateInputOptions(options)).to.deep.equal(expectations);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });
});