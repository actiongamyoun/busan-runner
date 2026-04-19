'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppProvider';
import { Hero } from '@/components/Hero';
import { CourseGrid } from '@/components/CourseGrid';
import { CourseModal } from '@/components/CourseModal';
import { MeetList } from '@/components/MeetList';
import { MeetCreateModal } from '@/components/MeetCreateModal';
import { CrewGrid } from '@/components/CrewGrid';
import { CrewCreateModal } from '@/components/CrewCreateModal';
import { CrewJoinModal } from '@/components/CrewJoinModal';
import { MarketGrid } from '@/components/MarketGrid';
import { MarketCreateModal } from '@/components/MarketCreateModal';
import { ProfilePanel } from '@/components/ProfilePanel';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { ConfirmDialog, type ConfirmMode } from '@/components/ConfirmDialog';
import { useCourses, useCourseLikes, useCourseSaves } from '@/lib/hooks/useCourses';
import { useMeets } from '@/lib/hooks/useMeets';
import { useCrews } from '@/lib/hooks/useCrews';
import { useMarket } from '@/lib/hooks/useMarket';
import type { Course, Crew } from '@/lib/database.types';

export default function HomePage() {
  const { t, view, sessionId, showToast, lang, profile } = useApp();

  // 공통 상태
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [meetModalOpen, setMeetModalOpen] = useState(false);
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [crewToJoin, setCrewToJoin] = useState<Crew | null>(null);
  const [marketModalOpen, setMarketModalOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState('all');
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const [pendingDeleteMeet, setPendingDeleteMeet] = useState<number | null>(null);
  const [pendingDeleteCrew, setPendingDeleteCrew] = useState<number | null>(null);
  const [pendingDeleteMarket, setPendingDeleteMarket] = useState<number | null>(null);

  // Supabase 훅
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { likes: likedIds, toggle: toggleLike } = useCourseLikes(sessionId);
  const { saves: savedIds, toggle: toggleSave } = useCourseSaves(sessionId);
  const { meets, joinedIds: meetJoinedIds, create: createMeet, remove: removeMeet, toggleJoin: toggleMeetJoin } = useMeets(sessionId);
  const { crews, joinedIds: crewJoinedIds, myApplicants, loading: crewsLoading,
          create: createCrew, remove: removeCrew, join: joinCrew, leave: leaveCrew } = useCrews(sessionId);
  const { items: marketItems, loading: marketLoading,
          create: createMarket, remove: removeMarket,
          toggleLike: toggleMarketLike, updateStatus: updateMarketStatus,
          addComment: addMarketComment, deleteComment: deleteMarketComment } = useMarket(sessionId);

  // 스크롤 상단
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [view]);

  // 핸들러
  const handleStartHero = () => {
    if (courses.length > 0) setSelectedCourse(courses[0]);
  };

  const handleCourseLike = async (id: number) => {
    const wasLiked = likedIds.has(id);
    await toggleLike(id);
    showToast(wasLiked ? t('market.unliked') : t('market.liked'));
  };

  const handleCourseModalSave = async () => {
    if (!selectedCourse) return;
    const nowSaved = await toggleSave(selectedCourse.id);
    showToast(nowSaved ? t('course.save.toast') : t('course.unsave.toast'));
  };

  const handleCourseModalStart = () => {
    if (!selectedCourse) return;
    const n = lang === 'en' ? (selectedCourse.name_en || selectedCourse.name) : selectedCourse.name;
    showToast(`${t('course.start.toast.prefix')}${n}${t('course.start.toast.suffix')}`);
    setSelectedCourse(null);
  };

  const handleMeetJoinToggle = async (id: number) => {
    const result = await toggleMeetJoin(id);
    if (result === 'full') showToast(t('meet.spots.full'));
    else if (result === 'joined') showToast(t('meet.joined.toast'));
    else showToast(t('meet.left.toast'));
  };

  const handleMeetDelete = (id: number) => {
    setPendingDeleteMeet(id);
    setConfirmMode('meet');
  };

  const handleCrewDelete = (id: number) => {
    setPendingDeleteCrew(id);
    setConfirmMode('crew');
  };

  const handleCrewLeave = async (id: number) => {
    await leaveCrew(id);
    showToast(t('crew.left.toast'));
  };

  const handleCrewJoinSubmit = async (greeting: string): Promise<'joined' | 'full'> => {
    if (!crewToJoin) return 'full';
    return await joinCrew(crewToJoin.id, greeting, profile.nickname, profile.color);
  };

  const handleMarketDelete = (id: number) => {
    setPendingDeleteMarket(id);
    setConfirmMode('market');
  };

  const handleMarketLike = async (id: number) => {
    const item = marketItems.find(i => i.id === id);
    const wasLiked = item?.is_liked;
    await toggleMarketLike(id);
    showToast(wasLiked ? t('market.unliked') : t('market.liked'));
  };

  const handleMarketComment = async (id: number, content: string) => {
    await addMarketComment(id, content, profile.nickname, profile.color);
  };

  const handleConfirm = async () => {
    if (confirmMode === 'meet' && pendingDeleteMeet != null) {
      await removeMeet(pendingDeleteMeet);
      showToast(t('meet.deleted.toast'));
    } else if (confirmMode === 'crew' && pendingDeleteCrew != null) {
      await removeCrew(pendingDeleteCrew);
      showToast(t('crew.deleted.toast'));
    } else if (confirmMode === 'market' && pendingDeleteMarket != null) {
      await removeMarket(pendingDeleteMarket);
      showToast(t('market.deleted.toast'));
    }
    setConfirmMode(null);
    setPendingDeleteMeet(null);
    setPendingDeleteCrew(null);
    setPendingDeleteMarket(null);
  };

  return (
    <>
      {/* HOME VIEW */}
      {view === 'home' && (
        <>
          <Hero onStart={handleStartHero} />

          <div className="search-row">
            <div className={`search-box ${search ? 'has-value' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('search.placeholder')}
              />
              <button className="search-clear" onClick={() => setSearch('')} aria-label="clear">✕</button>
            </div>
          </div>

          <section className="section" id="routesSection">
            <div className="section-head">
              <div>
                <div className="section-num serif">{t('section.routes.num')}</div>
                <h2 className="serif">
                  <span>{t('section.routes.title.1')}</span>
                  <em>{t('section.routes.title.2')}</em>
                  <span>{t('section.routes.title.3')}</span>
                </h2>
              </div>
            </div>
            {coursesError && (
              <div className="empty">
                <div className="empty-mark">{t('common.error')}</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>{coursesError}</div>
              </div>
            )}
            {coursesLoading ? (
              <div className="empty"><div>{t('common.loading')}</div></div>
            ) : (
              <CourseGrid
                courses={courses}
                likedIds={likedIds}
                filter={filter}
                search={search}
                onFilterChange={setFilter}
                onLikeToggle={handleCourseLike}
                onCardClick={setSelectedCourse}
              />
            )}
          </section>

          <section className="section" id="meetsSection">
            <div className="section-head">
              <div>
                <div className="section-num serif">{t('section.meets.num')}</div>
                <h2 className="serif">
                  <span>{t('section.meets.title.1')}</span>
                  <em>{t('section.meets.title.2')}</em>
                  <span>{t('section.meets.title.3')}</span>
                </h2>
              </div>
              <button className="create-meet-btn" onClick={() => setMeetModalOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t('section.meets.create')}
              </button>
            </div>
            <MeetList
              meets={meets}
              joinedIds={meetJoinedIds}
              onJoinToggle={handleMeetJoinToggle}
              onDelete={handleMeetDelete}
            />
          </section>
        </>
      )}

      {/* CREW VIEW */}
      {view === 'crew' && (
        <>
          <header className="page-header">
            <div className="section-num serif">{t('crew.page.num')}</div>
            <h1 className="serif">
              <span>{t('crew.page.title.1')}</span>
              <em>{t('crew.page.title.2')}</em>
              <span>{t('crew.page.title.3')}</span>
            </h1>
            <p>{t('crew.page.desc')}</p>
          </header>

          <div className="market-toolbar">
            <span className="market-count">
              <b>{crews.length}</b>{t('crew.count.suffix')}
            </span>
            <div className="page-tools">
              <button className="create-meet-btn" onClick={() => setCrewModalOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t('crew.create')}
              </button>
            </div>
          </div>

          {crewsLoading ? (
            <div className="empty"><div>{t('common.loading')}</div></div>
          ) : (
            <CrewGrid
              crews={crews}
              joinedIds={crewJoinedIds}
              myApplicants={myApplicants}
              onJoin={setCrewToJoin}
              onLeave={handleCrewLeave}
              onDelete={handleCrewDelete}
            />
          )}
        </>
      )}

      {/* MARKET VIEW */}
      {view === 'market' && (
        <>
          <header className="page-header">
            <div className="section-num serif">{t('market.page.num')}</div>
            <h1 className="serif">
              <span>{t('market.page.title.1')}</span>
              <em>{t('market.page.title.2')}</em>
              <span>{t('market.page.title.3')}</span>
            </h1>
            <p>{t('market.page.desc')}</p>
          </header>

          <div className="market-toolbar" style={{ marginBottom: 8 }}>
            <span className="market-count">
              <b>{marketItems.length}</b>{t('market.count.suffix')}
            </span>
            <div className="page-tools">
              <button className="create-meet-btn" onClick={() => setMarketModalOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t('market.create')}
              </button>
            </div>
          </div>

          {marketLoading ? (
            <div className="empty"><div>{t('common.loading')}</div></div>
          ) : (
            <MarketGrid
              items={marketItems}
              filter={marketFilter}
              onFilterChange={setMarketFilter}
              onLike={handleMarketLike}
              onDelete={handleMarketDelete}
              onStatusChange={updateMarketStatus}
              onComment={handleMarketComment}
              onCommentDelete={deleteMarketComment}
            />
          )}
        </>
      )}

      {/* PROFILE VIEW */}
      {view === 'profile' && (
        <ProfilePanel
          courses={courses}
          likedIds={likedIds}
          savedIds={savedIds}
          crews={crews}
          joinedCrewIds={crewJoinedIds}
          meets={meets}
          marketItems={marketItems}
          onEditProfile={() => setProfileEditOpen(true)}
        />
      )}

      {/* 공통 모달 */}
      <CourseModal
        course={selectedCourse}
        isSaved={selectedCourse ? savedIds.has(selectedCourse.id) : false}
        onClose={() => setSelectedCourse(null)}
        onToggleSave={handleCourseModalSave}
        onStart={handleCourseModalStart}
      />
      <MeetCreateModal
        open={meetModalOpen}
        courses={courses}
        onClose={() => setMeetModalOpen(false)}
        onSubmit={async (input) => { await createMeet(input); }}
      />
      <CrewCreateModal
        open={crewModalOpen}
        onClose={() => setCrewModalOpen(false)}
        onSubmit={async (input) => { await createCrew(input); }}
      />
      <CrewJoinModal
        crew={crewToJoin}
        onClose={() => setCrewToJoin(null)}
        onSubmit={handleCrewJoinSubmit}
      />
      <MarketCreateModal
        open={marketModalOpen}
        onClose={() => setMarketModalOpen(false)}
        onSubmit={async (input) => { await createMarket(input); }}
      />
      <ProfileEditModal
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
      />
      <ConfirmDialog
        mode={confirmMode}
        onCancel={() => {
          setConfirmMode(null);
          setPendingDeleteMeet(null);
          setPendingDeleteCrew(null);
          setPendingDeleteMarket(null);
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
}
