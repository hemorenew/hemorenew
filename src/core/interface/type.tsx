/* eslint-disable @typescript-eslint/no-explicit-any */
// types.ts

// ObjectList Type
export type ObjectListProps = {
  objects: string[];
  selectedObject: any;
  handleObjectClick: (obj: string) => void;
};

// VideoPage Types
export type ObjectFound = {
  object: string[];
  timestamp: string;
};

// Category and Project Types
export type ProjectType = {
  id: string;
  name: string;
  description: string;
  summary: string;
};

export type CategoryType = {
  id: string;
  name: string;
  description: string;
  summary: string;
  user_id: string;
  project_id: string;
};

export type VideoData = {
  id?: string;
  video: any;
  ground_detections: { [key: string]: GroundDetection };
  annotated_video: string;
  original_video: string;
  name: string;
  description: string;
  summary: string;
  all_names: string[];
  all_classes: number[];
};

export type GroundDetection = {
  names: string[];
  classes: number[];
  data: DataTimestamp[];
};

export type DataTimestamp = {
  confidence: number;
  track_id: number;
  name: string;
  class: number;
  timestamp: string;
};

// VideoList Type
export type VideoListProps = {
  videos: [] | any;
  videoSearchTerm: string;
  handleVideoSelect?: (video: any) => void;
  handleVideoSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  twoClick: (id: string | number) => void;
  editClick: (id: string | number) => void;
  oneClick: (
    video: any,
    description: string,
    summary: string,
    path: string
  ) => void;
  arrowClick: (id: string | number, index?: string) => void;
  processElementClick?: (
    id: string | number,
    name: string,
    description: string,
    advancedSearch: string,
    searchType: string,
    characteristics: string,
    algorithm: string,
    parameters?: string[]
  ) => void;

  texts: any;
  hiddenArrow?: boolean;
  showEditIcon: boolean;
};

export type DropdownOptions = {
  [key: string]: {
    options: string[];
    subOptions: {
      [key: string]: string[];
    };
  };
};

// UploadForm Type

export type UploadFormProps = {
  handleUpload: () => void;
  progress: number;
  videoName: string;
  setVideoName: (name: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newDescription: string;
  setNewDescription: (name: string) => void;
  newSummary: string;
  setNewSummary: (name: string) => void;
  placeholderVideoName: string;
  placeholderDescription: string;
  placeholderSummary: string;
  showError: boolean;
  isUploading?: boolean;
};

// CreateForm Type

export type CreateFormProps = {
  newName: string;
  setNewName: (value: string) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  newSummary: string;
  setNewSummary: (value: string) => void;
  placeholderSummary: string;
  handleCreate: () => void;
  placeholderName: string;
  placeholderDescription: string;
  buttonLabel: string;
  showError: boolean;
};

// Auth Types

export type AuthServiceProps = {
  validate: (password: string, dbPassword: string) => Promise<boolean>;
};

//User Types

export type User = {
  id: string | number;
  firstName: string;
  lastName: string;
  token: string;
  tokenExpires: number;
};

// New User Types

export type NewUser = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

// IronSession Types
export type IronSessionProps = {
  password: string;
  cookieName: string;
};

// AuthContext Types

export type AuthContextType = {
  isLoggedIn: boolean;
  userData: UserDataType;
  userLoaded: boolean;
  mutateUser: (user: any) => void;
};

export type UserDataType = {
  id: number;
  name: string;
  token: string;
  tokenExpires: string;
};

// AnalysisView Types
export type AnalysisViewProps = {
  dataVideo: VideoData[];
  videoDetails?: Array<Record<any, any>>;
  videoSectionRef: React.RefObject<HTMLDivElement>;
  originalUrlVIdeo: string;
};

// TimelineDataList Types
export type TimelineDataListProps = {
  data: { time: string; objects: string[] }[];
  onTimestampClick: (timestamp: string) => void;
};

//FineDetails Types

export type DescriptionGeneral = {
  '<OD>': {
    '<OD>': {
      bboxes: [number, number, number, number][];
      labels: string[];
    };
  };
  '<MORE_DETAILED_CAPTION>': {
    '<MORE_DETAILED_CAPTION>': string;
  };
};

export type DescriptionResultsCrop = {
  result_aux: {
    '<MORE_DETAILED_CAPTION>': string;
  };
  result_task: { '<COLOR_DETECTION> The car is': string };
};

export type FrameDetails = {
  frame_number: number;
  s3_path: string;
  description_general: DescriptionGeneral;
  description_results_crop: DescriptionResultsCrop;
};

export type VideoFineDetails = {
  [timestamp: string]: FrameDetails[];
};

//New Project Types

export type NewProject = {
  name: string;
  description: string;
  summary: string;
  user_id?: string | number;
  status: string;
  metadata?: { [key: string]: string };
  start_date: string;
};

//New Category Types

export type NewCategory = {
  name: string;
  description: string;
  summary: string;
  user_id?: string | number;
  project_id: string;
};

export type NewVideo = {
  file: File;
  status?: string;
  name?: string;
  description: string;
  summary: string;
  frame_rate: number;
};

// SearchInput Types
export type SearchInputProps = {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

// ListElement Types

export type FilteredListProps = {
  object: ProjectType[] | CategoryType[];
  searchTerm: string;
  oneClick: (projectName: string, projectId: string) => void;
  twoClick: (projectId: string) => void;
  arrowClick: (projectName: string, projectId: string) => void;
  editClick: (projectId: string) => void;
  urlImage: string;
  noProjectsMessage: string;
};

// VideoDetails Modal

export type ModalProps = {
  src: string;
  description: string;
  onClose: () => void;
};

// VideoDetails GalleryModal

export type GalleryModalProps = {
  images: { src: string; description: string }[];
  currentIndex: number;
  onClose: () => void;
  onImageSelect: (index: number) => void;
};
