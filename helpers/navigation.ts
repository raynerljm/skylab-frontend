export enum PAGES {
  LANDING = "/",
  PROJECTS = "/projects",
  STAFF = "/staff",
  PROFILE = "/profile",
  EDIT_PROFILE = "/profile/edit",
  FORGOT_PASSWORD = "/forgot-password",
  MILESTONES = "/milestones",
  USERS = "/users",
}

export enum NAVBAR_ACTIONS {
  SIGN_OUT = "signOut",
}

export const NAVBAR_OPTIONS = [
  { label: "Profile", route: PAGES.PROFILE },
  { label: "Projects", route: PAGES.PROJECTS },
  { label: "Staff", route: PAGES.STAFF },
  { label: "Milestones", route: PAGES.MILESTONES },
  { label: "Users", route: PAGES.USERS },
  { label: "Sign Out", action: NAVBAR_ACTIONS.SIGN_OUT },
];
