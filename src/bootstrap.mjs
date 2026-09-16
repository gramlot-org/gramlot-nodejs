// Host integration: application declarations remain in the transported Source.
import {Application, HtmlBuilder} from 'gramlot-dom';

const root = document.getElementById('root');
try {
  const {source} = JSON.parse(document.getElementById('startup').textContent);
  const builder = new HtmlBuilder('main');
  builder.loadSource(source);
  const application = new Application(root, builder, {inspector: false});
  root.dataset.gramlotState = 'ready';
  window.addEventListener('pagehide', event => {
    if (!event.persisted) application.dispose();
  });
} catch (error) {
  root.dataset.gramlotState = 'error';
  const message = document.getElementById('error');
  message.hidden = false;
  message.textContent = error.message;
}
