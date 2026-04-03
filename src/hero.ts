import { heroui } from "@heroui/theme/plugin";

const hero: ReturnType<typeof import("tailwindcss/plugin").default> = heroui();
export default hero;
