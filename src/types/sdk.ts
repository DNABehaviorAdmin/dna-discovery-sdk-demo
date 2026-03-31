export interface SDKConfig {
  accountId: string;
  selfRegistrationId: string;
  encryptionKey: string;
  subscriptionKey: string;
  questionPattern: '11' | '17' | '46';
  firstname: string;
  lastname: string;
  email: string;
}

export interface WebhookPayload {
  PersonID: number;
  CreditID: number;
  UserName: string;
  AccountID: number;
  AssignedNameUser: string;
  Tag: Array<{ TagID: number; TagName: string }>;
  FirstName: string;
  LastName: string;
  FullName: string;
  DiscoveryType: number;
  DiscoveryCompletionDate: string;
}

export type SDKScreen = 'instructions' | 'questionnaire' | 'dashboard';

export interface SDKEvent {
  type: 'screenChanged';
  value: SDKScreen;
}
