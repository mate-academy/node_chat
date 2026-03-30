import { FormikHelpers } from 'formik';

export type SubmitCallback = (
  values: Record<string, string>,
  formikHelpers: FormikHelpers<Record<string, string>>,
) => Promise<void>;
