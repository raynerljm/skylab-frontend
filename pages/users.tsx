import LoadingSpinner from "@/components/emptyStates/LoadingSpinner";
import NoneFound from "@/components/emptyStates/NoneFound";
import Body from "@/components/layout/Body";
import AddUserModal from "@/components/modals/AddUserModal";
import UserTable from "@/components/tables/UserTable";
import NoDataWrapper from "@/components/wrappers/NoDataWrapper";
import useCohort from "@/hooks/useCohort";
import { isFetching } from "@/hooks/useFetch";
import useInfiniteFetch, {
  createBottomOfPageRef,
} from "@/hooks/useInfiniteFetch";
import { Cohort } from "@/types/cohorts";
import { ROLES_WITH_ALL } from "@/types/roles";
import { User } from "@/types/users";
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
} from "@mui/material";
import type { NextPage } from "next";
import {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const users: User[] = [
  {
    id: 0,
    name: "Rayner",
    email: "raynerljm@u.nus.edu",
    student: {
      id: 1,
      cohortYear: 2022,
      projectId: 0,
      nusnetId: "e0572281",
      matricNo: "a0214871fx",
    },
  },
  {
    id: 1,
    name: "Zechary",
    email: "zecharyajw@u.nus.edu",
    adviser: {
      id: 23,
      cohortYear: 2022,
      projectIds: [0],
      nusnetId: "e0572281",
      matricNo: "a0214871fx",
    },
  },
  {
    id: 2,
    name: "Vijay",
    email: "nvjn@u.nus.edu",
    mentor: {
      id: 17,
      cohortYear: 2022,
      projectIds: [0],
    },
  },
  {
    id: 3,
    name: "Prof Zhao Jin",
    email: "jinzhao@u.nus.edu",
    student: {
      id: 99,
      cohortYear: 2022,
      projectId: 9,
      nusnetId: "123",
      matricNo: "321",
    },
    adviser: {
      id: 99,
      cohortYear: 2022,
      nusnetId: "123",
      matricNo: "321",
      projectIds: [0],
    },

    mentor: {
      id: 18,
      cohortYear: 2022,
      projectIds: [0],
    },
    administrator: {
      id: 1232,
      startDate: "",
      endDate: "",
    },
  },
];

export type GetUsersResponse = {
  users: User[];
};

const LIMIT = 50;

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
    Cohort["academicYear"] | string
  >("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  /** For fetching users based on filters */
  const memoQueryParams = useMemo(() => {
    return {
      cohortYear: selectedCohortYear,
      role: selectedRole,
      search: querySearch,
      limit: LIMIT,
    };
  }, [selectedCohortYear, selectedRole, querySearch]);
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: usersToDo,
    status: fetchUsersStatus,
    hasMore,
    mutate,
  } = useInfiniteFetch<GetUsersResponse, User>({
    endpoint: `/users`,
    queryParams: memoQueryParams,
    page,
    responseToData: (response) => response.users,
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
    }, 500),
    []
  );

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTextInput(e.target.value);
    debouncedSetQuerySearch(e.target.value);
    setPage(0);
  };

  const handleCohortYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedCohortYear(Number(e.target.value) as Cohort["academicYear"]);
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
        cohorts={cohorts as Cohort[]}
        cohortYear={selectedCohortYear as Cohort["academicYear"]}
        mutate={mutate}
        hasMore={hasMore}
      />
      <Body isLoading={isLoadingCohorts}>
        <Stack direction="column" mt="0.5rem" mb="1rem">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            mb={{ md: "0.5rem" }}
          >
            <Stack direction="row" spacing="1rem">
              <TextField
                label="Search"
                value={searchTextInput}
                onChange={handleSearchInputChange}
                size="small"
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenAddUserModal}
              >
                <Add fontSize="small" sx={{ marginRight: "0.2rem" }} />
                User
              </Button>
            </Stack>
            <TextField
              name="cohort"
              label="Cohort"
              value={selectedCohortYear}
              onChange={handleCohortYearChange}
              select
              size="small"
            >
              {cohorts &&
                cohorts.map(({ academicYear }) => (
                  <MenuItem key={academicYear} value={academicYear}>
                    {academicYear}
                  </MenuItem>
                ))}
            </TextField>
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
        <NoDataWrapper
          noDataCondition={users === undefined || users.length === 0}
          fallback={<NoneFound message="No such users found" />}
        >
          <UserTable users={users} mutate={mutate} />
          <div ref={bottomOfPageRef} />
          {isFetching(fetchUsersStatus) ? (
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                marginY: users.length === 0 ? "15vh" : 0,
              }}
            >
              <LoadingSpinner />
            </Box>
          ) : null}
        </NoDataWrapper>
      </Body>
    </>
  );
};
export default Users;
