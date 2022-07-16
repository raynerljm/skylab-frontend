import { FC, MouseEvent, useState } from "react";
// Components
import DeleteProjectModal from "@/components/modals/DeleteProjectModal";
import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import UsersName from "@/components/typography/UsersName";
// Helpers
import { PAGES } from "@/helpers/navigation";
// Types
import { Mutate } from "@/hooks/useFetch";
import { LEVELS_OF_ACHIEVEMENT, Project } from "@/types/projects";
import { BASE_TRANSITION } from "@/styles/constants";

type Props = {
  project: Project;
  mutate?: Mutate<Project[]>;
  setSuccess: (message: string) => void;
  setError: (error: unknown) => void;
  showEditAction: boolean;
  showDeleteAction: boolean;
};

const ProjectRow: FC<Props> = ({
  project,
  mutate,
  setSuccess,
  setError,
  showEditAction,
  showDeleteAction,
}) => {
  const [dropdownAnchorElement, setDropdownAnchorElement] =
    useState<HTMLElement | null>(null);
  const isDropdownOpen = Boolean(dropdownAnchorElement);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  const handleOpenDropdown = (e: MouseEvent<HTMLButtonElement>) => {
    setDropdownAnchorElement(e.currentTarget);
  };

  const handleCloseDropdown = () => {
    setDropdownAnchorElement(null);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteProjectOpen(true);
  };

  const renderTag = () => {
    if (!project?.achievement) return;

    switch (project.achievement) {
      case LEVELS_OF_ACHIEVEMENT.VOSTOK:
        return (
          <Chip
            key={`project ${project.id}`}
            label={LEVELS_OF_ACHIEVEMENT.VOSTOK}
            color="primary"
            size="small"
          />
        );
      case LEVELS_OF_ACHIEVEMENT.GEMINI:
        return (
          <Chip
            key={`project ${project.id}`}
            label={LEVELS_OF_ACHIEVEMENT.GEMINI}
            color="secondary"
            size="small"
          />
        );
      case LEVELS_OF_ACHIEVEMENT.APOLLO:
        return (
          <Chip
            key={`project ${project.id}`}
            label={LEVELS_OF_ACHIEVEMENT.APOLLO}
            color="info"
            size="small"
          />
        );

      case LEVELS_OF_ACHIEVEMENT.ARTEMIS:
        return (
          <Chip
            key={`project ${project.id}`}
            label={LEVELS_OF_ACHIEVEMENT.ARTEMIS}
            color="success"
            size="small"
          />
        );
    }
  };

  return (
    <>
      {showDeleteAction && mutate && (
        <DeleteProjectModal
          open={isDeleteProjectOpen}
          setOpen={setIsDeleteProjectOpen}
          project={project}
          mutate={mutate}
          setSuccess={setSuccess}
          setError={setError}
        />
      )}
      <TableRow>
        <TableCell>{project.id}</TableCell>
        <TableCell>{project.name}</TableCell>
        <TableCell>
          <Stack direction="row" spacing="0.25rem">
            {renderTag()}
          </Stack>
        </TableCell>
        <TableCell>
          {project.students
            ? project.students.map((student) => (
                <UsersName key={student.id} user={student} />
              ))
            : null}
        </TableCell>
        <TableCell>
          {project.adviser && project.adviser.id ? (
            <UsersName user={project.adviser} />
          ) : null}
        </TableCell>
        <TableCell>
          {project.mentor && project.mentor.id ? (
            <UsersName user={project.mentor} />
          ) : null}
        </TableCell>
        <TableCell>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenDropdown}
            endIcon={<KeyboardArrowDown />}
          >
            Options
          </Button>
          <Menu
            anchorEl={dropdownAnchorElement}
            open={isDropdownOpen}
            onClose={handleCloseDropdown}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Link href={`${PAGES.PROJECTS}/${project.id}`} passHref>
              <MenuItem>View</MenuItem>
            </Link>
            {showEditAction && (
              <Link href={`${PAGES.PROJECTS}/${project.id}/edit`} passHref>
                <MenuItem>Edit</MenuItem>
              </Link>
            )}
            {showDeleteAction && (
              <MenuItem
                onClick={handleOpenDeleteModal}
                sx={{
                  transition: BASE_TRANSITION,
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "white",
                  },
                }}
              >
                Delete
              </MenuItem>
            )}
          </Menu>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ProjectRow;
