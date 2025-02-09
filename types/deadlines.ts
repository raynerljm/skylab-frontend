import { Cohort } from "./cohorts";
import { Project } from "./projects";
import { Submission } from "./submissions";
import { User } from "./users";

export enum DEADLINE_TYPE {
  MILESTONE = "Milestone",
  EVALUATION = "Evaluation",
  FEEDBACK = "Feedback",
  APPLICATION = "Application", // TODO: Not implemented yet
}

export type Deadline = {
  id: number;
  cohortYear: Cohort["academicYear"];
  name: string;
  desc?: string;
  dueBy: string;
  type: DEADLINE_TYPE;
  createdAt: string;
  updatedAt: string;
  evaluating?: Deadline;
};

export type Section = {
  id: string;
  deadlineId: number;
  sectionNumber: number;
  name: string;
  desc?: string;
  questions: Question[];
};

export type LeanSection = Omit<
  Section,
  "id" | "deadlineId" | "sectionNumber" | "questions"
> & { questions: LeanQuestion[] };

export enum QUESTION_TYPE {
  SHORT_ANSWER = "ShortAnswer",
  PARAGRAPH = "Paragraph",
  MULTIPLE_CHOICE = "MultipleChoice",
  CHECKBOXES = "Checkboxes",
  DROPDOWN = "Dropdown",
  URL = "Url",
  DATE = "Date",
  TIME = "Time",
}

export type Question = {
  id: number;
  sectionId: number;
  questionNumber: number;
  question: string;
  desc?: string;
  type: QUESTION_TYPE;
  options?: Option[];
  isAnonymous?: boolean;
};

export type LeanQuestion = Omit<
  Question,
  "id" | "questionNumber" | "deadlineId" | "sectionId"
>;

export type Option = string;

/**
 * The deliverables of a Deadline
 * Eg.
 * - 'Milestone 2 Evaluation' is a deadline
 *   - This is what the administrator sets on the `/manage/deadlines` page
 * - 'Milestone 2 Evaluation for Team 2 by Team 1' is a deadline deliverable
 *   - This is what users see on the `/dashboard/<role>` page when viewing upcoming deadlines
 */
export type DeadlineDeliverable = {
  deadline: Deadline;
  // Only applicable for deadline type 'Evaluation' and 'Feedback'
  toProject?: Project;
  toProjectSubmission?: Submission; // Exists only when toProject has a submission for the specified deadline
  // Only applicable for student role and deadline type 'Feedback' => addressed to the adviser
  toUser?: User;
  // Only exists if a draft OR submission has been created
  submission?: Submission;
};

export enum VIEWER_ROLE {
  PROJECTS,
  ADVISERS,
}
