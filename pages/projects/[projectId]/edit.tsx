import type { NextPage } from "next";
// Components
import Body from "@/components/layout/Body";
import TextInput from "@/components/formikFormControllers/TextInput";
import {
  Alert,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import GoBackButton from "@/components/buttons/GoBackButton";
import Dropdown from "@/components/formikFormControllers/Dropdown";
import MultiDropdown from "@/components/formikFormControllers/MultiDropdown";
import NoneFound from "@/components/emptyStates/NoneFound";
import NoDataWrapper from "@/components/wrappers/NoDataWrapper";
import UnauthorizedWrapper from "@/components/wrappers/UnauthorizedWrapper";
// Hooks
import useApiCall from "@/hooks/useApiCall";
import useSnackbarAlert from "@/contexts/useSnackbarAlert";
import { useRouter } from "next/router";
import useFetch, { isFetching } from "@/hooks/useFetch";
import useAuth from "@/contexts/useAuth";
// Helpers
import { Formik } from "formik";
import { areAllEmptyValues, stripEmptyStrings } from "@/helpers/forms";
import { checkIfProjectsAdviser, userHasRole } from "@/helpers/roles";
// Types
import { GetProjectResponse, GetUsersResponse, HTTP_METHOD } from "@/types/api";
import { LEVELS_OF_ACHIEVEMENT, Project } from "@/types/projects";
import { ROLES } from "@/types/roles";
import Switch from "@/components/formikFormControllers/Switch";

type EditProjectFormValues = Pick<
  Project,
  | "name"
  | "teamName"
  | "achievement"
  | "proposalPdf"
  | "posterUrl"
  | "videoUrl"
  | "hasDropped"
> & { students: number[]; adviser: number | ""; mentor: number | "" };

const EditProject: NextPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { projectId } = router.query;
  const { setSuccess, setError } = useSnackbarAlert();

  const { data: projectResponse, status: getProjectStatus } =
    useFetch<GetProjectResponse>({
      endpoint: `/projects/${projectId}`,
      enabled: !!projectId,
    });
  const project = projectResponse ? projectResponse.project : undefined;

  const initialValues: EditProjectFormValues = {
    name: project?.name ?? "",
    teamName: project?.teamName ?? "",
    achievement: project?.achievement ?? LEVELS_OF_ACHIEVEMENT.VOSTOK,
    students: project?.students
      ? project?.students.map(({ studentId }) => studentId)
      : [],
    adviser: project?.adviser?.adviserId ?? "",
    mentor: project?.mentor?.mentorId ?? "",
    hasDropped: project?.hasDropped ?? false,
    proposalPdf: project?.proposalPdf ?? "",
    posterUrl: project?.posterUrl ?? "",
    videoUrl: project?.videoUrl ?? "",
  };

  /** Fetching student, adviser and mentor IDs and names for the dropdown select */
  const { data: studentsResponse } = useFetch<GetUsersResponse>({
    endpoint: `/users/lean?cohortYear=${project?.cohortYear}&role=Student`,
    enabled: Boolean(!!project && project.cohortYear),
  });
  const { data: advisersResponse } = useFetch<GetUsersResponse>({
    endpoint: `/users/lean?cohortYear=${project?.cohortYear}&role=Adviser`,
    enabled: Boolean(!!project && project.cohortYear),
  });
  const { data: mentorsResponse } = useFetch<GetUsersResponse>({
    endpoint: `/users/lean?cohortYear=${project?.cohortYear}&role=Mentor`,
    enabled: Boolean(!!project && project.cohortYear),
  });

  const EditProject = useApiCall({
    method: HTTP_METHOD.PUT,
    endpoint: `/projects/${projectId}`,
  });

  const handleSubmit = async (values: EditProjectFormValues) => {
    const processedValues = stripEmptyStrings(values);
    try {
      await EditProject.call(processedValues);
      setSuccess("You have successfully edited the project details");
    } catch (error) {
      setError(error);
    }
  };

  return (
    <>
      <Body
        isLoading={isFetching(getProjectStatus) || isLoading}
        authorizedRoles={[ROLES.ADMINISTRATORS]}
      >
        <NoDataWrapper
          noDataCondition={project === undefined}
          fallback={
            <NoneFound
              showReturnHome
              message="There is no such project with that project ID"
            />
          }
        >
          <UnauthorizedWrapper
            isUnauthorized={
              !userHasRole(user, ROLES.ADMINISTRATORS) &&
              !checkIfProjectsAdviser(projectResponse?.project, user)
            }
          >
            <GoBackButton />
            <Container maxWidth="sm" sx={{ padding: 0 }}>
              <Typography variant="h5" fontWeight={600} mb="1rem">
                {`Edit ${project?.name}'s Project`}
              </Typography>
              <Card>
                <CardContent>
                  <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                    {(formik) => (
                      <form onSubmit={formik.handleSubmit}>
                        <Stack direction="column" spacing="1rem">
                          {!userHasRole(user, ROLES.ADMINISTRATORS) && (
                            <Alert color="warning" icon={<></>}>
                              You do not have the permissions to edit some of
                              the team&apos;s details
                            </Alert>
                          )}
                          <TextInput
                            name="name"
                            label="Project Name"
                            formik={formik}
                          />
                          <TextInput
                            name="teamName"
                            label="Team Name"
                            formik={formik}
                          />
                          <Dropdown
                            name="achievement"
                            label="Level of Achievement"
                            formik={formik}
                            options={Object.values(LEVELS_OF_ACHIEVEMENT).map(
                              (option) => {
                                return { label: option, value: option };
                              }
                            )}
                            isDisabled={
                              !userHasRole(user, ROLES.ADMINISTRATORS)
                            }
                          />
                          <MultiDropdown
                            name="students"
                            label="Student IDs"
                            formik={formik}
                            isCombobox
                            options={
                              studentsResponse && studentsResponse.users
                                ? studentsResponse.users.map((user) => {
                                    return {
                                      label: `${user?.student?.id}: ${user.name}`,
                                      value: user?.student?.id ?? 0,
                                    };
                                  })
                                : []
                            }
                            isDisabled={
                              !userHasRole(user, ROLES.ADMINISTRATORS)
                            }
                          />
                          <Dropdown
                            name="adviser"
                            label="Adviser ID"
                            formik={formik}
                            isCombobox
                            options={
                              advisersResponse && advisersResponse.users
                                ? advisersResponse.users.map((user) => {
                                    return {
                                      label: `${user?.adviser?.id}: ${user.name}`,
                                      value: user?.adviser?.id ?? 0,
                                    };
                                  })
                                : []
                            }
                            isDisabled={
                              !userHasRole(user, ROLES.ADMINISTRATORS)
                            }
                          />
                          <Dropdown
                            name="mentor"
                            label="Mentor ID"
                            formik={formik}
                            isCombobox
                            options={
                              mentorsResponse && mentorsResponse.users
                                ? mentorsResponse.users.map((user) => {
                                    return {
                                      label: `${user?.mentor?.id}: ${user.name}`,
                                      value: user?.mentor?.id ?? 0,
                                    };
                                  })
                                : []
                            }
                            isDisabled={
                              !userHasRole(user, ROLES.ADMINISTRATORS)
                            }
                          />
                          <TextInput
                            name="proposalPdf"
                            label="Proposal PDF URL"
                            formik={formik}
                          />
                          <TextInput
                            name="posterUrl"
                            label="Poster URL"
                            formik={formik}
                          />
                          <TextInput
                            name="videoUrl"
                            label="Video URL"
                            formik={formik}
                          />
                          <Switch
                            name="hasDropped"
                            label="Has Dropped"
                            formik={formik}
                            isDisabled={
                              !userHasRole(user, ROLES.ADMINISTRATORS)
                            }
                          />

                          <Stack direction="row" justifyContent="end">
                            <LoadingButton
                              type="submit"
                              variant="contained"
                              disabled={areAllEmptyValues(formik.values)}
                              loading={formik.isSubmitting}
                            >
                              Save
                            </LoadingButton>
                          </Stack>
                        </Stack>
                      </form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
            </Container>
          </UnauthorizedWrapper>
        </NoDataWrapper>
      </Body>
    </>
  );
};
export default EditProject;
