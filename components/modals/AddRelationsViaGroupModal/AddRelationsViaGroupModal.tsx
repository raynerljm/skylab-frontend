import { Dispatch, FC, SetStateAction } from "react";
// Components
import Modal from "../Modal";
import { Button, Stack } from "@mui/material";
import MultiDropdown from "@/components/formikFormControllers/MultiDropdown";
// Helpers
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ERRORS } from "@/helpers/errors";
// Hooks
import useApiCall from "@/hooks/useApiCall";
import useSnackbarAlert from "@/contexts/useSnackbarAlert";
import { useRouter } from "next/router";
// Types
import { HTTP_METHOD } from "@/types/api";
import { Project } from "@/types/projects";

const refreshSeconds = 3;

interface AddRelationGroupFormValuesType {
  projectIds: [];
}

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  projects: Project[];
};

const AddRelationsViaGroupModal: FC<Props> = ({ open, setOpen, projects }) => {
  const { setSuccess, setError } = useSnackbarAlert();
  const router = useRouter();

  const addRelationsViaGroup = useApiCall({
    method: HTTP_METHOD.POST,
    endpoint: `/relations/group`,
  });

  const initialValues: AddRelationGroupFormValuesType = {
    projectIds: [],
  };

  const handleSubmit = async (
    values: AddRelationGroupFormValuesType,
    actions: FormikHelpers<AddRelationGroupFormValuesType>
  ) => {
    const processedValues = values;

    try {
      await addRelationsViaGroup.call(processedValues);
      setSuccess(
        `You have successfully created the relations! Refreshing in ${refreshSeconds} seconds...`
      );
      setTimeout(() => {
        router.reload();
      }, refreshSeconds * 1000);
      handleCloseModal();
      actions.resetForm();
    } catch (error) {
      setError(error);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        handleClose={handleCloseModal}
        title={`Add Group`}
        subheader="Adding 'groups' is a shortcut to add multiple relations at once. For example, creating a group with three projects A, B, and C would result in 6 relations being created: A -> B, A -> C, B -> A, B -> C, C -> A, C -> B."
      >
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={addRelationGroupValidationSchema}
        >
          {(formik) => (
            <>
              <Stack direction="column" spacing="1rem">
                <MultiDropdown
                  name="projectIds"
                  label="Projects"
                  formik={formik}
                  size="small"
                  isCombobox
                  options={
                    projects && projects.length
                      ? projects.map((project) => {
                          return {
                            label: `${project.id}: ${project.name}`,
                            value: project.id,
                          };
                        })
                      : []
                  }
                />
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                marginTop="2rem"
              >
                <Button size="small" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={formik.submitForm}
                  disabled={formik.isSubmitting}
                >
                  Add
                </Button>
              </Stack>
            </>
          )}
        </Formik>
      </Modal>
    </>
  );
};
export default AddRelationsViaGroupModal;

const addRelationGroupValidationSchema = Yup.object().shape({
  projectIds: Yup.array().min(1, ERRORS.REQUIRED).required(ERRORS.REQUIRED),
});
