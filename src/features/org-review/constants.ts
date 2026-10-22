export const orgReviewFiltersKey = (orgId: string) => `org-review-filters:${orgId}`;

export const ALL_ROLES_PARAM = "all";

export const ORG_REVIEW_FILTER_PARAMS = ["role", "view", "streams"] as const;

export const REVIEW_CONTROL_BAR_CLASSES = "flex flex-wrap items-end justify-between gap-x-6 gap-y-3";

// A narrow list of separate cards next to one big resume pane: the resume is what you read,
// the list is where you are.
export const REVIEW_BOARD_GRID_CLASSES =
	"grid grid-cols-1 gap-6 lg:h-[calc(100dvh-11rem)] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]";

export const REVIEW_LEFT_CARD_CLASSES = "relative flex flex-col overflow-visible rounded-none border-0 bg-transparent p-0";

export const REVIEW_RIGHT_CARD_CLASSES =
	"hidden overflow-visible rounded-v2-lg border-v2-border-pane p-0 shadow-v2-content lg:block";
