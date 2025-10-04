// overrides.ts
export interface LogoOverrideSets {
  [logoSet: string]: {
    [listId: string]: {
      [logoName: string]: string;
    };
  };
}

export interface LogoOverrides {
  _v: string;
  sets: LogoOverrideSets;
}
