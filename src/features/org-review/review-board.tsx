"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { TooltipProvider } from "@v2/components/ui/tooltip";
import { useTalentBoardOpen, useTalentDecisionKeyboard } from "@v2/features/org-shared-cards";
import { RolePickerModal } from "@v2/features/org-shared-modals";
import { prefetchOrgTalentProfile } from "@v2/features/org-talent-profile";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { usePersistFilterParams } from "@v2/hooks/use-persisted-search";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SendoutListEntry } from "@/services/api/organizations";
import {
	ALL_ROLES_PARAM,
	ORG_REVIEW_FILTER_PARAMS,
	orgReviewFiltersKey,
	REVIEW_BOARD_GRID_CLASSES,
	REVIEW_CONTROL_BAR_CLASSES,
	REVIEW_LEFT_CARD_CLASSES,
	REVIEW_RIGHT_CARD_CLASSES,
} from "./constants";
import { HmRequiredModal } from "./hm-required-modal";
import { useDefaultReviewRole } from "./hooks/use-default-review-role";
import { usePrefetchNextProfile } from "./hooks/use-prefetch-next-profile";
import { useReviewBoard } from "./hooks/use-review-board";
import { useSendoutLists } from "./hooks/use-sendout-lists";
import { InvitedView } from "./invited-view";
import { PassedView } from "./passed-view";
import { usePassedItems } from "./hooks/use-passed-items";
import { useInvitedItems } from "./hooks/use-invited-items";
import { ReviewBoardProvider } from "./review-board-context";
import { ReviewBoardGridSkeleton } from "./review-board-grid-skeleton";
import { ReviewBoardSkeleton } from "./review-board-skeleton";
import { ReviewEmpty } from "./review-empty";
import { ReviewHeader } from "./review-header";
import { ReviewIncomingToggle, type ReviewView } from "./review-incoming-toggle";
import { ReviewLeftList } from "./review-left-list";
import { matchesReviewQuery, type QuickFilterId, ReviewPromptBox } from "./review-prompt-box";
import { ReviewMobileSheet } from "./review-mobile-sheet";
import { ReviewRightPane } from "./review-right-pane";
import { ReviewRoleFilter } from "./review-role-filter";
import { ReviewScopeBar } from "./review-scope-bar";
import { ReviewStreamFilter } from "./review-stream-filter";
import { parseReviewStreams, serializeReviewStreams, setReviewUrlParams } from "./review-url";
import { SimilarPicksModal } from "./similar-picks-modal";
import { type ReviewItem, type ReviewStream, reviewItemKey } from "./types";

interface ReviewBoardProps {
	orgId: string;
	roleParam?: string;
	talentId?: string;
	view?: string;
	streams?: string;
	sendoutNanoId?: string;
	sendoutTalentIds?: readonly string[];
	canUseTalentSearch: boolean;
	viewerIsPlatformAdmin?: boolean;
	/** False for viewers: they can read the queue, not decide on it. */
	canDecide?: boolean;
}

export function ReviewBoard({
	orgId,
	roleParam,
	talentId,
	view,
	streams,
	sendoutNanoId,
	sendoutTalentIds,
	canUseTalentSearch,
	viewerIsPlatformAdmin = false,
	canDecide = true,
}: ReviewBoardProps) {
	const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
		roleParam === ALL_ROLES_PARAM ? undefined : roleParam,
	);
	const [activeSendout, setActiveSendout] = useState<{ nanoId: string; talentIds: readonly string[] } | undefined>(
		sendoutNanoId && sendoutTalentIds ? { nanoId: sendoutNanoId, talentIds: sendoutTalentIds } : undefined,
	);
	const clearSendoutScope = useCallback(() => {
		setActiveSendout(undefined);
		setReviewUrlParams({ sendout: undefined });
	}, []);
	const selectSendout = useCallback((drop: SendoutListEntry) => {
		setActiveSendout({ nanoId: drop.nanoId, talentIds: drop.talentIds });
		setReviewUrlParams({ sendout: drop.nanoId });
	}, []);
	const handleRoleChange = useCallback(
		(next: string | undefined) => {
			setSelectedRoleId(next);
			setReviewUrlParams({ role: next ?? ALL_ROLES_PARAM });
			clearSendoutScope();
		},
		[clearSendoutScope],
	);
	usePersistFilterParams(orgReviewFiltersKey(orgId), ORG_REVIEW_FILTER_PARAMS);
	const applyDefaultRole = useCallback((param: string | undefined) => {
		setSelectedRoleId(param === ALL_ROLES_PARAM ? undefined : param);
		setReviewUrlParams({ role: param });
	}, []);
	useDefaultReviewRole(orgId, roleParam === undefined && !talentId, applyDefaultRole);
	const { data: sendoutDrops = [] } = useSendoutLists(orgId, selectedRoleId);
	const board = useReviewBoard(orgId, selectedRoleId, talentId, parseReviewStreams(streams), activeSendout?.talentIds);
	const isMobile = useMediaQuery("(max-width: 1023px)");
	const queryClient = useQueryClient();
	const [mobileTalent, setMobileTalent] = useState<ReviewItem | null>(null);
	const [activeView, setActiveView] = useState<ReviewView>(
		view === "passed" || view === "invited" ? view : "review",
	);
	const passedCount = usePassedItems(orgId, selectedRoleId).query.data?.totalCount;
	const invitedCount = useInvitedItems(orgId, selectedRoleId).data?.totalCount;
	const listRef = useRef<HTMLDivElement>(null);
	const [query, setQuery] = useState("");
	const [quickFilter, setQuickFilter] = useState<QuickFilterId | null>(null);
	const isFiltering = !!query || !!quickFilter;
	const visibleItems = useMemo(
		() => (isFiltering ? board.items.filter((item) => matchesReviewQuery(item, query, quickFilter)) : board.items),
		[board.items, query, quickFilter, isFiltering],
	);
	usePrefetchNextProfile(orgId, board.items, board.selectedKey);

	const { selectedKey } = board;
	useEffect(() => {
		if (!selectedKey) return;
		listRef.current
			?.querySelector(`[data-board-key="${CSS.escape(selectedKey)}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [selectedKey]);

	const handlePrefetch = useCallback(
		(talentId: string) => prefetchOrgTalentProfile(queryClient, orgId, talentId),
		[queryClient, orgId],
	);
	const handleSelect = useCallback(
		(item: ReviewItem) => {
			board.selectItem(item);
			if (isMobile) setMobileTalent(item);
		},
		[board, isMobile],
	);
	const openTalent = useTalentBoardOpen(orgId, "review");
	const handleOpen = useCallback((item: ReviewItem) => openTalent(item.talentId), [openTalent]);
	const handleListIntro = useCallback(
		(item: ReviewItem) => {
			board.selectItem(item);
			board.openIntro(item);
		},
		[board],
	);
	const handleListPass = useCallback(
		(item: ReviewItem) => {
			board.selectItem(item);
			board.openPass(item);
		},
		[board],
	);
	const closeMobile = useCallback(() => setMobileTalent(null), []);
	const mobilePassRef = useRef(false);
	const mobilePanelWasOpen = useRef(false);
	const mobilePanelOpen = !!board.panel;
	useEffect(() => {
		if (mobilePanelOpen) {
			mobilePanelWasOpen.current = true;
			return;
		}
		if (mobilePanelWasOpen.current && mobilePassRef.current) {
			mobilePassRef.current = false;
			setMobileTalent(null);
		}
		mobilePanelWasOpen.current = false;
	}, [mobilePanelOpen]);

	const handleViewChange = useCallback((next: ReviewView) => {
		setActiveView(next);
		setReviewUrlParams({ view: next === "review" ? undefined : next });
	}, []);
	const { setStreams } = board;
	const handleStreamsChange = useCallback(
		(next: ReviewStream[]) => {
			setStreams(next);
			setReviewUrlParams({ streams: serializeReviewStreams(next) });
		},
		[setStreams],
	);

	// The feed is paged: the list may hold 11 of 20. Count everyone waiting, unless a
	// candidate-type filter narrows the list, where only the loaded people are known.
	const streamFiltered = board.items.length < board.streamCounts.all;
	const waitingTotal = streamFiltered ? board.items.length : Math.max(board.totalCount, board.items.length);

	const anyModalOpen = !!board.rolePickerItem || board.hmWarningOpen || !!board.followThrough;
	useTalentDecisionKeyboard({
		selected: board.selected,
		enabled: canDecide && !isMobile && !anyModalOpen,
		panelOpen: !!board.panel,
		onIntro: board.openIntro,
		onOpenPass: board.openPass,
		onSelectPrev: board.selectPrev,
		onSelectNext: board.selectNext,
	});

	if (board.isLoading) {
		return <ReviewBoardSkeleton />;
	}

	const incomingEmpty = board.streamCounts.all === 0;
	const showEmptyState = incomingEmpty;
	const showScopeBar = !!activeSendout || sendoutDrops.length > 0;

	return (
		<ReviewBoardProvider value={board}>
			<TooltipProvider delayDuration={150}>
				<div className="flex flex-col gap-6">
					<div className={REVIEW_CONTROL_BAR_CLASSES}>
						<ReviewIncomingToggle
							view={activeView}
							onChange={handleViewChange}
							counts={{
								review: board.isSwitching ? undefined : incomingEmpty ? 0 : waitingTotal,
								passed: passedCount,
								invited: invitedCount,
							}}
						/>
						<div className="flex flex-wrap items-center gap-2">
							<ReviewRoleFilter orgId={orgId} roleId={selectedRoleId} byRole={board.byRole} onChange={handleRoleChange} />
							{activeView === "review" && !incomingEmpty && (
								<ReviewStreamFilter streams={board.streams} counts={board.streamCounts} onChange={handleStreamsChange} />
							)}
						</div>
					</div>

					{activeView === "invited" ? (
						<InvitedView orgId={orgId} selectedRoleId={selectedRoleId} />
					) : activeView === "passed" ? (
						<PassedView orgId={orgId} selectedRoleId={selectedRoleId} viewerIsPlatformAdmin={viewerIsPlatformAdmin} />
					) : board.isSwitching ? (
						<ReviewBoardGridSkeleton />
					) : showEmptyState ? (
						<div>
							{showScopeBar && (
								<ReviewScopeBar
									drops={sendoutDrops}
									activeNanoId={activeSendout?.nanoId}
									feedTalentIds={board.feedTalentIds}
									onSelect={selectSendout}
									onClear={clearSendoutScope}
									className="border-b border-v2-border-divider"
								/>
							)}
							<ReviewEmpty
								orgId={orgId}
								roleId={selectedRoleId}
								roleFeedCount={board.roleFeedCount}
								hasActiveSendout={!!activeSendout}
								canUseTalentSearch={canUseTalentSearch}
								byRole={board.byRole}
								pausedPending={board.pausedPending}
								onClearSendout={clearSendoutScope}
								onRoleChange={handleRoleChange}
							/>
						</div>
					) : (
						<div className={REVIEW_BOARD_GRID_CLASSES}>
							<Card className={REVIEW_LEFT_CARD_CLASSES}>
								{showScopeBar && (
									<ReviewScopeBar
										drops={sendoutDrops}
										activeNanoId={activeSendout?.nanoId}
										feedTalentIds={board.feedTalentIds}
										onSelect={selectSendout}
										onClear={clearSendoutScope}
										className="border-b border-v2-border-divider"
									/>
								)}
								<ReviewHeader
									remaining={waitingTotal}
									reviewed={board.reviewedCount}
								/>
								<div ref={listRef} className="px-1 pt-1 pb-44 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
									{visibleItems.length === 0 && isFiltering ? (
										<EmptyState heading="No one matches" description="Nobody in this list matches that. Try another filter." />
									) : board.items.length === 0 ? (
										<EmptyState
											heading={incomingEmpty ? "All reviewed" : "Nothing here"}
											description={
												incomingEmpty
													? "Nothing waiting on you for this role."
													: "No candidates match this filter right now."
											}
										/>
									) : (
										<ReviewLeftList
											items={visibleItems}
											selectedKey={board.selectedKey}
											onSelect={handleSelect}
											onOpen={isMobile ? undefined : handleOpen}
											onPrefetch={handlePrefetch}
											onIntro={isMobile || !canDecide ? undefined : handleListIntro}
											onPass={isMobile || !canDecide ? undefined : handleListPass}
											isPending={board.isPending}
											chipsFor={board.chipsFor}
											onCardVisible={board.onCardVisible}
											onCardSeen={board.onCardSeen}
											showRole={!selectedRoleId}
											grouped={!isFiltering}
										/>
									)}
								</div>
								<ReviewPromptBox
									value={query}
									onChange={setQuery}
									activeFilter={quickFilter}
									onFilterChange={setQuickFilter}
								/>
							</Card>
							<Card className={REVIEW_RIGHT_CARD_CLASSES}>
								<ReviewRightPane
									orgId={orgId}
									selectedRoleId={selectedRoleId}
									viewerIsPlatformAdmin={viewerIsPlatformAdmin}
									canDecide={canDecide}
								/>
							</Card>
						</div>
					)}
				</div>

				<ReviewMobileSheet
					orgId={orgId}
					talent={mobileTalent}
					open={!!mobileTalent && isMobile}
					canDecide={canDecide}
					isPending={mobileTalent ? board.isPending(mobileTalent) : false}
					onClose={closeMobile}
					onInterview={(item) => {
						mobilePassRef.current = true;
						board.openIntro(item);
					}}
					onPass={(item) => {
						mobilePassRef.current = true;
						board.openPass(item);
					}}
				/>

				{board.followThrough && (
					<SimilarPicksModal
						key={reviewItemKey(board.followThrough.anchor)}
						orgId={orgId}
						followThrough={board.followThrough}
						onContinue={board.continueReviewing}
					/>
				)}
				<HmRequiredModal
					isOpen={board.hmWarningOpen}
					onOpenChange={(open) => {
						if (!open) board.closeHmWarning();
					}}
					onContinue={board.continueFromHmWarning}
					orgId={orgId}
					roleId={board.hmWarningRoleId}
					reason={board.hmWarningReason}
					hmName={board.hmWarningHmName}
					hmContactId={board.hmWarningHmContactId}
				/>
				<RolePickerModal
					orgId={orgId}
					isOpen={!!board.rolePickerItem}
					talentName={board.rolePickerItem?.talentName ?? ""}
					action={board.rolePickerAction}
					isPending={board.rolePickerItem ? board.isPending(board.rolePickerItem) : false}
					onOpenChange={(open) => {
						if (!open) board.closeRolePicker();
					}}
					onConfirm={board.confirmRolePicker}
				/>
			</TooltipProvider>
		</ReviewBoardProvider>
	);
}

ReviewBoard.displayName = "ReviewBoard";
