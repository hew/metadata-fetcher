import {useRef, useState} from 'react';
import crypto from 'crypto-js';

enum Protocol {
  HTTPS = 'https',
  IPFS = 'ipfs',
  SHA256 = 'sha256',
}

const getAfterDoubleSlash = /(?<=:\/\/).*/;
const getBeforeDoubleSlash = /.*?(?=:\/\/)/;
const getBeforeSingleSlash = /.*(?=\/)/;
const getAfterSingleSlash = /(?<=\/).*/;

/*
 * @description - regex helper
 */
const matchUriWithRegex = (uri: string, rgx: RegExp): string => {
  const matched = uri.match(rgx);
  return matched.length ? matched[0] : '';
};

/*
 * @description - fetch helper
 */
const fetchEndpoint = async (uri: string): Promise<string> => {
  const [err, response] = await $$(fetch(uri));

  if (err) throw new Error(err.message);

  return response.text();
};

/*
 * @description - retrieve metadata from different protocols
 */
interface Response {
  data: MetadataInterface;
  verified: boolean;
}
async function getMetadata(uri: string): Promise<Response> {
  const protocol = matchUriWithRegex(uri, getBeforeDoubleSlash);

  if (protocol === Protocol.HTTPS) {
    const metadata = await fetchEndpoint(uri);
    return {data: JSON.parse(metadata), verified: undefined};
  }

  if (protocol === Protocol.IPFS) {
    const cid = matchUriWithRegex(uri, getAfterDoubleSlash);
    const metadata = await fetchEndpoint(`https://ipfs.io/ipfs/${cid}`);
    return {data: JSON.parse(metadata), verified: undefined};
  }

  if (protocol === Protocol.SHA256) {
    const afterProtocol = matchUriWithRegex(uri, getAfterDoubleSlash);
    const hex = matchUriWithRegex(afterProtocol, getBeforeSingleSlash);
    const rawLink = matchUriWithRegex(afterProtocol, getAfterSingleSlash);
    const link = rawLink.replace(/%2F/g, '/');
    const metadata = await fetchEndpoint(link);
    const receivedHash = crypto.SHA256(metadata);
    const receivedHex = receivedHash.toString(crypto.enc.Hex);

    if (`0x${receivedHex}` !== hex) {
      return {data: JSON.parse(metadata), verified: false};
    }

    return {data: JSON.parse(metadata), verified: true};
  }
}

export default function Home() {
  const inputRef = useRef(undefined);
  const [metaData, setMetaData] = useState({} as MetadataInterface);
  const [verified, setVerified] = useState(undefined);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const {value} = inputRef.current;
    const {data, verified} = await getMetadata(value);
    setMetaData(data);
    setVerified(verified);
  };

  console.log(verified, 'verified');
  return (
    <div>
      <div className="flex justify-center mt-5 mb-5">
        <div className="w-6/12">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              name="url"
              id="url"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-4 py-4"
              placeholder="Enter URL"
            />
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      {Object.keys(metaData).length > 0 && (
        <article>
          <div className="text-xs flex justify-center py-5">
            <div>
              {verified !== undefined && (
                <p className={verified ? 'text-green-900' : 'text-red-900'}>
                  {verified
                    ? 'Data Verified'
                    : 'Data Could Not Be Verified'}
                </p>
              )}
              <pre>{JSON.stringify(metaData, null, '\t')}</pre>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
