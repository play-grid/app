import createConfig from '@playgrid/eslint-config/create-config';
//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config';
import query from '@tanstack/eslint-plugin-query';

export default await createConfig({ react: true }, { ...query.configs['flat/recommended'], ...tanstackConfig });
