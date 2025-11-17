const API = '/api/paste';
const LIMIT = 200;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const tpl = $('#item-tpl');

const el = {
  form: $('#paste-form'),
  name: $('#name'),
  text: $('#text'),
  list: $('#list'),
  refresh: $('#refresh'),
  copyAll: $('#copy-all'),
};

async function fetchList() {
  const res = await fetch(`${API}?limit=${LIMIT}`, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`����ʧ�� ${res.status}`);
  const data = await res.json();
  renderList(data.items || []);
}

function renderList(items) {
  el.list.innerHTML = '';
  items.forEach(item => {
    const node = tpl.content.cloneNode(true);
    $('.author', node).textContent = item.author ? item.author : '����';
    $('.time', node).textContent = new Date(item.ts).toLocaleString();
    $('.content', node).textContent = item.text; // �� textContent ��ֹ XSS
    const btn = $('.copy', node);
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(item.text);
      btn.textContent = '�Ѹ���';
      setTimeout(() => (btn.textContent = '���ƴ���'), 1200);
    });
    el.list.appendChild(node);
  });
}

el.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    author: el.name.value.trim(),
    text: el.text.value,
  };
  if (!payload.text.trim()) return;
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    alert(`�ύʧ�ܣ�${msg}`);
    return;
  }
  el.text.value = '';
  await fetchList();
});

el.refresh.addEventListener('click', fetchList);

el.copyAll.addEventListener('click', async () => {
  const blocks = $$('.item').map(card => $('.content', card).textContent);
  const all = blocks.join('\n\n-----\n\n');
  if (!all) return;
  await navigator.clipboard.writeText(all);
  el.copyAll.textContent = '�Ѹ���ȫ��';
  setTimeout(() => (el.copyAll.textContent = '����ȫ��'), 1200);
});

fetchList().catch(err => {
  el.list.innerHTML = `<p style="color:#b91c1c">����ʧ�ܣ�${String(err)}</p>`;
});
