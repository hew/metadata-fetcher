import {useEffect, useRef, useState} from 'react';
import {sha256} from 'js-sha256';
import {fetchEndpoint, matchUriWithRegex} from '../helpers'

enum Protocol {
  HTTPS = 'https',
  IPFS = 'ipfs',
  SHA256 = 'sha256',
}

const getAfterDoubleSlash = /(?<=:\/\/).*/;
const getBeforeDoubleSlash = /.*?(?=:\/\/)/;
const getBeforeSingleSlash = /.*(?=\/)/;
const getAfterSingleSlash = /(?<=\/).*/;

async function getMetadata(uri: string): Promise<MetadataInterface> {
  let metadata = {};
  const protocol = matchUriWithRegex(uri, getBeforeDoubleSlash);

  if (protocol === Protocol.HTTPS) {
    metadata = await fetchEndpoint(uri);
  }

  if (protocol === Protocol.IPFS) {
    const cid = matchUriWithRegex(uri, getAfterDoubleSlash);
    metadata = await fetchEndpoint(`https://ipfs.io/ipfs/${cid}`);
  }

  if (protocol === Protocol.SHA256) {
    const afterProtocol = matchUriWithRegex(uri, getAfterDoubleSlash);
    const hash = matchUriWithRegex(afterProtocol, getBeforeSingleSlash);
    const rawLink = matchUriWithRegex(afterProtocol, getAfterSingleSlash);
    const link = rawLink.replace(/%2F/g, '/');
    console.warn(hash, "unused hash")
    metadata = await fetchEndpoint(link);
  }

  return metadata;
}

export default function Home() {
  const inputRef = useRef(undefined);
  const [metaData, setMetaData] = useState(undefined as undefined | MetadataInterface);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const {value} = inputRef.current;
    const meta = await getMetadata(value);
    setMetaData(meta);
  };

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
      <div className="text-xs flex justify-center py-5">
        <pre>{JSON.stringify(metaData, null, '\t')}</pre>
      </div>
    </div>
  );
}
