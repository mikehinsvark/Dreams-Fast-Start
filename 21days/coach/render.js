import {coachHTML} from './content.js';
import {mountCoach} from './behavior.js';

// The parent supplies its existing React runtime and current referral ID.
// React owns the section; the fixed inner content is never swapped on scroll/state updates.
const content = {__html: coachHTML};
export function renderDreamsCoach(React, {agentId = ''} = {}) {
  const root = React.useRef(null);
  React.useEffect(() => mountCoach(root.current), []);
  React.useEffect(() => {
    const validId = /^AA[0-9]{4}$/.test(agentId) ? agentId : '';
    root.current.querySelectorAll('[data-personal-link]').forEach(link => {
      if (validId) {
        link.href = link.dataset.personalLink.replace('{AGENT_ID}', validId);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.removeAttribute('aria-disabled');
      } else {
        link.href = '#agent-id';
        link.removeAttribute('target');
        link.removeAttribute('rel');
      }
    });
  }, [agentId]);
  return React.useMemo(() => React.createElement('section', {
    id: 'ai-coach', className: 'content-section beginner-coach',
    'data-coach-version': '2.0', ref: root, dangerouslySetInnerHTML: content
  }), []);
}
