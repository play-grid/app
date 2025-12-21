//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config'
import createConfig from '@guess-logo/eslint-config/create-config';
import query from '@tanstack/eslint-plugin-query';


export default await createConfig({ react: true }, { ...query.configs['flat/recommended'], ...tanstackConfig,  });
