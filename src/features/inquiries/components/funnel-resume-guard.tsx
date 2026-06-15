const RESUME_GUARD =
  'try{var d=localStorage.getItem("cf-funnel-draft");if(d){if(JSON.parse(d).view==="onboarding"){var s=document.createElement("style");s.id="cf-resume-guard";s.textContent="[data-funnel-resume-hide]{display:none}";document.head.appendChild(s)}}}catch(e){}';

export function FunnelResumeGuard() {
  return <script>{RESUME_GUARD}</script>;
}
