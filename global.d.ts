interface MetadataInterface {
  name?: string;
  description?: string;
  version?: string;
  license?: {name: string; details?: string};
  authors?: string[];
  homepage?: string;
  source?: {tools?: string[]; location?: string};
}
