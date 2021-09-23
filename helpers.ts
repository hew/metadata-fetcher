/*
 * @description - Go-style network request helper
 */
export const $$ = (promise: Promise<any>): Promise<any> => {
  return promise.then(result => [null, result]).catch(err => [err]);
};

/*
 * @description - regex helper
 */
export const matchUriWithRegex = (uri: string, rgx: RegExp): string => {
  const matched = uri.match(rgx);
  return matched.length ? matched[0] : '';
};

/*
 * @description - fetch helper
 */
export const fetchEndpoint = async (uri: string): Promise<MetadataInterface> => {
  const [err, response] = await $$(fetch(uri));

  if (err) throw new Error(err.message);

  return response.json();
};
