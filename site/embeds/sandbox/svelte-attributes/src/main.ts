import App from "./App.svelte";
import "./styles.css";

const el = document.getElementById("app");
if (!el) {
  throw new Error("#app not found");
}

const app = new App({ target: el });
export default app;
