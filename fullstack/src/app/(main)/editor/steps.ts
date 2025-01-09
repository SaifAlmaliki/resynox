// Importing the `EditorFormProps` type definition, which defines the expected props for each form component.
import { EditorFormProps } from "@/lib/types";

// Importing individual form components that represent different sections of the editor or resume form.
import CoverLetterForm from "./forms/CoverLetterForm"; // Component for cover letter form.
import EducationForm from "./forms/EducationForm"; // Component for education details form.
import GeneralInfoForm from "./forms/GeneralInfoForm"; // Component for general information form.
import PersonalInfoForm from "./forms/PersonalInfoForm"; // Component for personal information form.
import SkillsForm from "./forms/SkillsForm"; // Component for skills form.
import SummaryForm from "./forms/SummaryForm"; // Component for summary or overview form.
import WorkExperienceForm from "./forms/WorkExperienceForm"; // Component for work experience form.

// `steps` is an array that defines the different sections (or steps) of the form editor process.
// Each step includes a title, the corresponding React component to render, and a unique key to identify the step.
export const steps: {
  title: string;  // Title of the step, displayed in the UI (e.g., "General info").
  component: React.ComponentType<EditorFormProps>; // React component to render for this step, accepts `EditorFormProps`.
  key: string;    // Unique identifier for the step, used for tracking or navigation.
}[] = [
  // First step: General Information form
  {
    title: "General info",      // Step title displayed to the user.
    component: GeneralInfoForm, // Component responsible for rendering the general information form.
    key: "general-info",        // Unique key for identifying this step in logic or navigation.
  },
  // Second step: Personal Information form
  { title: "Personal info", component: PersonalInfoForm, key: "personal-info" },
  // Third step: Work Experience form
  { title: "Work experience", component: WorkExperienceForm, key: "work-experience"},
  // Fourth step: Education details form
  { title: "Education", component: EducationForm, key: "education"},
  // Fifth step: Skills form
  { title: "Skills", component: SkillsForm, key: "skills"},
  // Sixth step: Summary form
  { title: "Summary", component: SummaryForm, key: "summary"},
  // Final step: Cover Letter form
  { title: "Cover Letter", component: CoverLetterForm, key: "cover-letter"},
];
