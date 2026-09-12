import { commentText, providers, setStatus } from './comments/shared';
import { lifecycle } from './core/lifecycle';
export async function initializeOtherProviders(
  enabled: import('./types').CommentProvider[],
) {
  const signal = lifecycle.signal;
  const adapter = await import('./comments/providers');
  if (!signal.aborted) await adapter.initializeOtherProviders(enabled);
}
export type { NormalizedComment } from './comments/valine-data';
const initializeComments = async () => {
  const signal = lifecycle.signal;
  const enabled = providers();
  if (!enabled.length) return;
  if (enabled.includes('valine')) {
    const { valineReady } = await import('./comments/valine-data');
    const {
      renderPostCardParticipants,
      renderAggregateSurfaces,
      renderMessageBarrage,
      renderAggregateCount,
      initializeValine,
    } = await import('./comments/valine');
    if (signal.aborted) return;
    if (valineReady()) {
      void renderPostCardParticipants();
      void renderAggregateSurfaces();
      void renderMessageBarrage();
      void renderAggregateCount();
      initializeValine();
    } else {
      document
        .querySelectorAll(
          '#vcomment, .recent-comments-list, .card-recent-comment .aside-list, .console_recentcomments, #message-barrage-status',
        )
        .forEach((container) => {
          setStatus(
            container,
            commentText('error', 'Unable to load comments'),
            'error',
          );
          container.setAttribute('aria-busy', 'false');
        });
    }
  }
  if (!enabled.includes('valine')) {
    const wall = document.querySelector<HTMLElement>('#message-barrage-status');
    if (wall) {
      wall.setAttribute('aria-busy', 'false');
      setStatus(wall, commentText('error', 'Unable to load comments'), 'error');
    }
  }
  if (enabled.some((provider) => provider !== 'valine')) {
    const { initializeOtherProviders } = await import('./comments/providers');
    if (!signal.aborted) void initializeOtherProviders(enabled);
  }
};

document.addEventListener('solitude:ready', initializeComments);

document.addEventListener('solitude:afterNavigate', initializeComments);
