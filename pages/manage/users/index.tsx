import {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import type { NextPage } from "next";
// Components
import Body from "@/components/layout/Body";
import LoadingSpinner from "@/components/emptyStates/LoadingSpinner";
import NoneFound from "@/components/emptyStates/NoneFound";
import AddUserModal from "@/components/modals/AddUserModal";
import UserTable from "@/components/tables/UserTable";
import NoDataWrapper from "@/components/wrappers/NoDataWrapper";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  debounce,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  tabsClasses,
  TextField,
  Typography,
} from "@mui/material";
// Helpers
import { PAGES } from "@/helpers/navigation";
// Hooks
import useCohort from "@/hooks/useCohort";
import useFetch, { isFetching } from "@/hooks/useFetch";
import useInfiniteFetch, {
  createBottomOfPageRef,
} from "@/hooks/useInfiniteFetch";
// Types
import { Cohort } from "@/types/cohorts";
import { ROLES, ROLES_WITH_ALL } from "@/types/roles";
import { User } from "@/types/users";
import { toSingular } from "@/helpers/roles";
import LoadingWrapper from "@/components/wrappers/LoadingWrapper";
import { GetLeanProjectsResponse, GetUsersResponse } from "@/types/api";
import AutoBreadcrumbs from "@/components/layout/AutoBreadcrumbs";

const LIMIT = 20;
const ALL = "All";

const Users: NextPage = () => {
  const [selectedRole, setSelectedRole] = useState<ROLES_WITH_ALL>(
    ROLES_WITH_ALL.ALL
  );
  const [page, setPage] = useState(0);
  const [searchTextInput, setSearchTextInput] = useState(""); // The input value
  const [querySearch, setQuerySearch] = useState(""); // The debounced input value for searching
  const {
    cohorts,
    currentCohortYear,
    isLoading: isLoadingCohorts,
  } = useCohort();
  const [selectedCohortYear, setSelectedCohortYear] = useState<
    Cohort["academicYear"] | "" | typeof ALL
  >("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  /** For fetching users based on filters */
  const memoUsersQueryParams = useMemo(() => {
    return {
      cohortYear: selectedCohortYear !== ALL ? selectedCohortYear : "",
      role: selectedRole !== ROLES_WITH_ALL.ALL ? toSingular(selectedRole) : "",
      search: querySearch,
      limit: LIMIT,
    };
  }, [selectedCohortYear, selectedRole, querySearch]);
  const {
    data: users,
    status: fetchUsersStatus,
    hasMore,
    mutate,
  } = useInfiniteFetch<GetUsersResponse, User>({
    endpoint: `/users`,
    queryParams: memoUsersQueryParams,
    page,
    responseToData: (response) => response.users,
    requiresAuthorization: true,
    enabled: !!selectedCohortYear,
  });

  /** For fetching project ID and names to create new users/roles */
  const memoLeanProjectsQueryParams = useMemo(() => {
    return {
      cohortYear: selectedCohortYear,
    };
  }, [selectedCohortYear]);
  const { data: leanProjectsResponse, status: fetchLeanProjectsStatus } =
    useFetch<GetLeanProjectsResponse>({
      endpoint: `/projects/lean`,
      queryParams: memoLeanProjectsQueryParams,
      requiresAuthorization: true,
      enabled: typeof selectedCohortYear === "number",
    });

  /** Input Change Handlers */
  const handleTabChange = (event: SyntheticEvent, newRole: ROLES_WITH_ALL) => {
    setSelectedRole(newRole);
    setPage(0);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetQuerySearch = useCallback(
    debounce((val) => {
      setQuerySearch(val);
      setPage(0);
    }, 500),
    []
  );

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTextInput(e.target.value);
    debouncedSetQuerySearch(e.target.value);
  };

  const handleCohortYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === ALL) {
      setSelectedCohortYear(e.target.value);
    } else {
      setSelectedCohortYear(Number(e.target.value) as Cohort["academicYear"]);
    }
    setPage(0);
  };

  const handleOpenAddUserModal = () => {
    setIsAddUserOpen(true);
  };

  /** To fetch more projects when the bottom of the page is reached */
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomOfPageRef = createBottomOfPageRef(
    isFetching(fetchUsersStatus),
    hasMore,
    setPage,
    observer
  );

  useEffect(() => {
    if (currentCohortYear) {
      setSelectedCohortYear(currentCohortYear);
    }
  }, [currentCohortYear]);

  return (
    <>
      <AddUserModal
        open={isAddUserOpen}
        setOpen={setIsAddUserOpen}
        mutate={mutate}
        hasMore={hasMore}
        leanProjects={leanProjectsResponse?.projects ?? []}
        isFetchingLeanProjects={isFetching(fetchLeanProjectsStatus)}
      />
      <Body
        isLoading={isLoadingCohorts}
        authorizedRoles={[ROLES.ADMINISTRATORS]}
      >
        <AutoBreadcrumbs />
        <Stack direction="column" mb="0.5rem">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            mb={{ md: "0.5rem" }}
          >
            <TextField
              label="Search"
              value={searchTextInput}
              onChange={handleSearchInputChange}
              size="small"
            />

            <Stack direction="row" spacing="1rem">
              <Link passHref href={PAGES.MANAGE_USERS_BATCH_ADD}>
                <Button size="small" variant="outlined">
                  <Add fontSize="small" sx={{ marginRight: "0.2rem" }} />
                  Batch Add
                </Button>
              </Link>
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenAddUserModal}
              >
                <Add fontSize="small" sx={{ marginRight: "0.2rem" }} />
                User
              </Button>
              <TextField
                label="Cohort"
                value={selectedCohortYear}
                onChange={handleCohortYearChange}
                select
                size="small"
              >
                <MenuItem value={ALL}>{ALL}</MenuItem>
                {cohorts &&
                  cohorts.map(({ academicYear }) => (
                    <MenuItem key={academicYear} value={academicYear}>
                      {academicYear}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
          </Stack>

          <Tabs
            value={selectedRole}
            onChange={handleTabChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="project-level-tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              [`& .${tabsClasses.scrollButtons}`]: { color: "primary" },
              marginY: { xs: 2, md: 0 },
            }}
          >
            {Object.values(ROLES_WITH_ALL).map((level) => {
              return <Tab key={level} value={level} label={level} />;
            })}
          </Tabs>
        </Stack>

        <LoadingWrapper
          isLoading={
            (users === undefined || users.length === 0) &&
            isFetching(fetchUsersStatus)
          }
        >
          <NoDataWrapper
            noDataCondition={users === undefined || users.length === 0}
            fallback={<NoneFound message="No such users found" />}
          >
            <UserTable
              users={users}
              mutate={mutate}
              leanProjects={leanProjectsResponse?.projects ?? []}
              isFetchingLeanProjects={isFetching(fetchLeanProjectsStatus)}
            />
            <div ref={bottomOfPageRef} />
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                height: "100px",
              }}
            >
              {isFetching(fetchUsersStatus) ? (
                <LoadingSpinner size={50} />
              ) : !hasMore ? (
                <Typography>No more users found</Typography>
              ) : null}
            </Box>
          </NoDataWrapper>
        </LoadingWrapper>
      </Body>
    </>
  );
};
export default Users;
