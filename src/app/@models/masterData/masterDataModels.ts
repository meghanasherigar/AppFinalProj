export class GlobalUltimateParent {
  Id: string;
  Name: string;
}

export class Organization {
  Id: string;
  Organization: string;
}
export class UseCase {
  id: string;
  name: string;
}

export class Industry{
  id: string;
  industry: string = '';
  subIndustries: Industry[]
}

