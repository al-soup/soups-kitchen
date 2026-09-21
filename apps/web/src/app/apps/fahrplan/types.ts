export interface CompletionItem {
  label: string;
  iconclass: string;
}

export interface StationboardStop {
  id: string;
  name: string;
  type: string;
  lon: number;
  lat: number;
}

export interface StationboardConnection {
  time: string;
  "*G": string;
  "*L": string;
  "*Z": string;
  type: string;
  line: string;
  operator: string;
  color: string;
  type_name: string;
  terminal: {
    id: string;
    name: string;
    lon: number;
    lat: number;
  };
  dep_delay?: string;
}

export interface StationboardResponse {
  stop: StationboardStop;
  connections: StationboardConnection[];
}
