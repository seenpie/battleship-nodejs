export type RegistrationData = {
  name: string;
  password: string;
};

export interface IClientService {
  getId: () => string;
}
