import { sound, useSoundOn } from "~/lib/sound";
import { SoundOffIcon, SoundOnIcon } from "./icons";

/** Portfolio interface-sound toggle. Off by default. */
export function SoundToggle() {
  const on = useSoundOn();
  return (
    <button
      type="button"
      data-sound-toggle
      aria-pressed={on}
      aria-label="Interface sound"
      title="Interface sound"
      className="icon-btn sound-toggle"
      onClick={() => sound.setOn(!on)}
    >
      <SoundOffIcon />
      <SoundOnIcon />
    </button>
  );
}
