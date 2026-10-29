from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'index.html'
SCRIPT = ROOT / 'script.js'
PROOF_TEST = ROOT / 'tests/rfq_proof.test.cjs'
SEARCH_TEST = ROOT / 'tests/search_discoverability.py'


def replace_exact(text, old, new, label):
    if text.count(old) != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {text.count(old)}')
    return text.replace(old, new, 1)

index = INDEX.read_text(encoding='utf-8')
proof_pattern = re.compile(r'    <section class="section proof-section" id="selected-rfq-work".*?\n    </section>\n\n    <section class="section audience-section"', re.S)
new_proof = '''    <section class="section proof-section" id="selected-rfq-work" aria-labelledby="proof-title">
      <div class="shell">
        <div class="proof-head reveal">
          <p class="section-index" data-i18n="sectionProof">04 / Selected RFQ work</p>
          <h2 id="proof-title" data-i18n-html="proofTitle">Exact-spec sourcing<br>for an overseas project supplier.</h2>
          <p class="section-intro" data-i18n="proofIntro">A real RFQ example showing how Leano approaches exact-spec sourcing, supply-route verification and commercial quotation work.</p>
        </div>

        <div class="proof-grid">
          <div class="proof-summary reveal">
            <p class="proof-label" data-i18n="proofSituationLabel">Situation</p>
            <p data-i18n="proofSituation">An overseas project supplier brought several live procurement requirements, including an exact-SKU branded computer requirement and a mixed ICT / access-control BOM. The requirement called for exact specifications rather than unverified substitutions.</p>
          </div>

          <div class="proof-actions reveal">
            <p class="proof-label" data-i18n="proofActionsLabel">What Leano did</p>
            <ul>
              <li data-i18n="proofAction1">Reviewed exact manufacturer part numbers and quantities.</li>
              <li data-i18n="proofAction2">Clarified destination and project timing before pricing.</li>
              <li data-i18n="proofAction3">Checked multiple potential supply routes for exact-spec availability.</li>
              <li data-i18n="proofAction4">Separated confirmed items from items that still required specification clarification.</li>
              <li data-i18n="proofAction5">Refused to silently substitute an exact part number that could not be reliably verified.</li>
              <li data-i18n="proofAction6">Prepared a commercial quotation for the verifiable portion of the mixed BOM.</li>
              <li data-i18n="proofAction7">Clearly stated quote validity, stock-reconfirmation requirements, freight exclusions and warranty limitations.</li>
            </ul>
          </div>

          <aside class="proof-decision reveal">
            <p class="proof-label" data-i18n="proofDecisionLabel">Decision standard</p>
            <p data-i18n="proofDecision">When one exact manufacturer part number could not be reliably confirmed through normal supply channels, Leano did not replace it with a similar model and present it as equivalent. The requirement remained unresolved pending exact-spec confirmation.</p>
          </aside>

          <div class="proof-outcome reveal">
            <p class="proof-label" data-i18n="proofOutcomeLabel">Work completed</p>
            <p data-i18n="proofOutcome">Supplier-route research, exact-spec verification and commercial quotation preparation for the verifiable portion of the RFQ.</p>
          </div>
        </div>

        <div class="proof-principles reveal" aria-label="What this demonstrates" data-i18n-aria="proofPrinciplesAria">
          <span data-i18n="proofPrinciple1">Exact requirement first.</span>
          <span data-i18n="proofPrinciple2">Verified supply before commitment.</span>
          <span data-i18n="proofPrinciple3">No silent substitutions.</span>
          <span data-i18n="proofPrinciple4">Commercial uncertainty stated clearly.</span>
        </div>
      </div>
    </section>

    <section class="section audience-section"'''
index, count = proof_pattern.subn(new_proof, index, count=1)
if count != 1:
    raise SystemExit(f'index proof section replacement failed: {count}')
INDEX.write_text(index, encoding='utf-8')

script = SCRIPT.read_text(encoding='utf-8')
replacements = {
    "      proofIntro: 'This example shows how Leano handled a real RFQ. It does not represent a completed transaction.',": "      proofIntro: 'A real RFQ example showing how Leano approaches exact-spec sourcing, supply-route verification and commercial quotation work.',",
    "      proofSituation: 'An overseas project supplier brought several live procurement requirements, including an exact-SKU branded computer requirement and a mixed ICT / access-control BOM. Exact specifications mattered more than convenient substitutions.',": "      proofSituation: 'An overseas project supplier brought several live procurement requirements, including an exact-SKU branded computer requirement and a mixed ICT / access-control BOM. The requirement called for exact specifications rather than unverified substitutions.',",
    "      proofAction4: 'Separated confirmed items from items that still required clarification.',": "      proofAction4: 'Separated confirmed items from items that still required specification clarification.',",
    "      proofAction6: 'Prepared a working commercial quotation for the verifiable portion of a mixed BOM.',": "      proofAction6: 'Prepared a commercial quotation for the verifiable portion of the mixed BOM.',",
    "      proofAction7: 'Stated quote validity, stock-reconfirmation requirements, freight exclusions and warranty limitations.',": "      proofAction7: 'Clearly stated quote validity, stock-reconfirmation requirements, freight exclusions and warranty limitations.',",
    "      proofDecision: 'When one exact manufacturer part number could not be reliably confirmed through normal supply channels, Leano did not replace it with a similar model and present it as equivalent. The item remained unresolved pending exact-spec confirmation.',": "      proofDecision: 'When one exact manufacturer part number could not be reliably confirmed through normal supply channels, Leano did not replace it with a similar model and present it as equivalent. The requirement remained unresolved pending exact-spec confirmation.',",
    "      proofOutcomeLabel: 'Outcome',": "      proofOutcomeLabel: 'Work completed',",
    "      proofOutcome: 'The sourcing and quotation work reached commercial review, but no purchase order, payment or delivery was completed.',": "      proofOutcome: 'Supplier-route research, exact-spec verification and commercial quotation preparation for the verifiable portion of the RFQ.',",

    "      proofIntro: '此实例用于展示 Leano 如何处理真实 RFQ，不代表已经完成交易。',": "      proofIntro: '一个真实 RFQ 实例，展示 Leano 如何进行精准规格寻源、供应路径核验和商业报价准备。',",
    "      proofSituation: '一家海外项目供应商向 Leano 提交了多项真实采购需求，其中包括精准 SKU 的品牌电脑需求，以及一份 ICT / 门禁设备混合 BOM。对方需要的是准确规格，而不是未经确认的相近替代。',": "      proofSituation: '一家海外项目供应商向 Leano 提交了多项真实采购需求，其中包括精准 SKU 的品牌电脑需求，以及一份 ICT / 门禁设备混合 BOM。该需求要求严格匹配准确规格，而不是使用未经核实的替代型号。',",
    "      proofAction4: '将已确认项目与仍需澄清规格的项目明确分开。',": "      proofAction4: '将已确认项目与仍需澄清规格的项目明确分开。',",
    "      proofAction6: '针对混合 BOM 中可核实的部分准备工作商业报价。',": "      proofAction6: '针对混合 BOM 中可核实的部分准备商业报价。',",
    "      proofAction7: '明确说明报价有效期、库存复核要求、运费排除项与保修限制。',": "      proofAction7: '明确说明报价有效期、库存复核要求、运费排除项与保修限制。',",
    "      proofDecision: '当其中一个准确制造商料号无法通过常规供应渠道得到可靠确认时，Leano 没有用相近型号替换并将其表述为等同产品。该项目保持未解决状态，等待精准规格进一步确认。',": "      proofDecision: '当其中一个准确制造商料号无法通过常规供应渠道可靠确认时，Leano 没有用相近型号替换并将其表述为等同产品。该需求保持未解决状态，等待精准规格确认。',",
    "      proofOutcomeLabel: '结果',": "      proofOutcomeLabel: '已完成工作',",
    "      proofOutcome: '寻源与报价工作推进到了商业评估阶段，但没有完成采购订单、付款或交付。',": "      proofOutcome: '针对 RFQ 中可核实部分完成供应路径研究、精准规格核验与商业报价准备。',",

    "      proofIntro: 'Cet exemple montre comment Leano a traité une RFQ réelle. Il ne représente pas une transaction finalisée.',": "      proofIntro: 'Un exemple réel de RFQ montrant comment Leano aborde le sourcing à spécification exacte, la vérification des routes d’approvisionnement et la préparation d’une cotation commerciale.',",
    "      proofSituation: 'Un fournisseur de projets à l’international a transmis plusieurs besoins d’achat réels, dont un ordinateur de marque à SKU exact et une BOM mixte ICT / contrôle d’accès. Les spécifications exactes primaient sur les substitutions de convenance.',": "      proofSituation: 'Un fournisseur de projets à l’international a transmis plusieurs besoins d’achat réels, dont un ordinateur de marque à SKU exact et une BOM mixte ICT / contrôle d’accès. Le besoin exigeait des spécifications exactes plutôt que des substitutions non vérifiées.',",
    "      proofAction4: 'Séparation claire entre les articles confirmés et ceux nécessitant encore une clarification.',": "      proofAction4: 'Séparation claire entre les articles confirmés et ceux nécessitant encore une clarification de spécification.',",
    "      proofAction6: 'Préparation d’une cotation commerciale de travail pour la partie vérifiable d’une BOM mixte.',": "      proofAction6: 'Préparation d’une cotation commerciale pour la partie vérifiable de la BOM mixte.',",
    "      proofAction7: 'Indication de la validité de l’offre, des besoins de reconfirmation du stock, des exclusions de fret et des limites de garantie.',": "      proofAction7: 'Indication claire de la validité de l’offre, des besoins de reconfirmation du stock, des exclusions de fret et des limites de garantie.',",
    "      proofDecision: 'Lorsqu’une référence fabricant exacte n’a pas pu être confirmée de manière fiable via les canaux d’approvisionnement habituels, Leano ne l’a pas remplacée par un modèle similaire présenté comme équivalent. L’article est resté non résolu dans l’attente d’une confirmation de la spécification exacte.',": "      proofDecision: 'Lorsqu’une référence fabricant exacte n’a pas pu être confirmée de manière fiable via les canaux d’approvisionnement habituels, Leano ne l’a pas remplacée par un modèle similaire présenté comme équivalent. Le besoin est resté non résolu dans l’attente de la confirmation de la spécification exacte.',",
    "      proofOutcomeLabel: 'Résultat',": "      proofOutcomeLabel: 'Travail réalisé',",
    "      proofOutcome: 'Le travail de sourcing et de cotation a atteint l’étape de l’examen commercial, mais aucun bon de commande, paiement ni livraison n’a été finalisé.',": "      proofOutcome: 'Recherche des routes d’approvisionnement, vérification des spécifications exactes et préparation d’une cotation commerciale pour la partie vérifiable de la RFQ.',",

    "      proofIntro: 'Этот пример показывает, как Leano работала с реальным RFQ. Он не означает, что сделка была завершена.',": "      proofIntro: 'Реальный пример RFQ, показывающий подход Leano к поиску по точной спецификации, проверке маршрутов поставки и подготовке коммерческого предложения.',",
    "      proofSituation: 'Зарубежный проектный поставщик передал несколько реальных закупочных запросов, включая брендовый компьютер с точным SKU и смешанную BOM по ICT / системам контроля доступа. Точные спецификации были важнее удобных замен.',": "      proofSituation: 'Зарубежный проектный поставщик передал несколько реальных закупочных запросов, включая брендовый компьютер с точным SKU и смешанную BOM по ICT / системам контроля доступа. Требование предусматривало точное соответствие спецификации, а не неподтверждённые замены.',",
    "      proofAction4: 'Разделила подтверждённые позиции и позиции, по которым ещё требовалось уточнение.',": "      proofAction4: 'Разделила подтверждённые позиции и позиции, где ещё требовалось уточнение спецификации.',",
    "      proofAction6: 'Подготовила рабочее коммерческое предложение по проверяемой части смешанной BOM.',": "      proofAction6: 'Подготовила коммерческое предложение по проверяемой части смешанной BOM.',",
    "      proofAction7: 'Явно указала срок действия предложения, необходимость повторного подтверждения наличия, исключения по перевозке и ограничения гарантии.',": "      proofAction7: 'Чётко указала срок действия предложения, необходимость повторного подтверждения наличия, исключения по перевозке и ограничения гарантии.',",
    "      proofDecision: 'Когда один точный номер детали производителя не удалось надёжно подтвердить через обычные каналы поставки, Leano не заменила его похожей моделью и не представила её как эквивалент. Позиция осталась нерешённой до повторного подтверждения точной спецификации.',": "      proofDecision: 'Когда один точный номер детали производителя не удалось надёжно подтвердить через обычные каналы поставки, Leano не заменила его похожей моделью и не представила её как эквивалент. Требование осталось нерешённым до подтверждения точной спецификации.',",
    "      proofOutcomeLabel: 'Результат',": "      proofOutcomeLabel: 'Выполненная работа',",
    "      proofOutcome: 'Работа по поиску и котировке дошла до коммерческого рассмотрения, но заказ на покупку, оплата и поставка не были завершены.',": "      proofOutcome: 'Исследование маршрутов поставки, проверка точной спецификации и подготовка коммерческого предложения по проверяемой части RFQ.',",

    "      proofIntro: 'Este ejemplo muestra cómo Leano gestionó una RFQ real. No representa una transacción completada.',": "      proofIntro: 'Un ejemplo real de RFQ que muestra cómo Leano aborda el sourcing con especificación exacta, la verificación de rutas de suministro y la preparación de cotizaciones comerciales.',",
    "      proofSituation: 'Un proveedor de proyectos internacional presentó varias necesidades reales de compra, entre ellas un ordenador de marca con SKU exacto y una BOM mixta de ICT / control de acceso. Las especificaciones exactas eran más importantes que las sustituciones por conveniencia.',": "      proofSituation: 'Un proveedor de proyectos internacional presentó varias necesidades reales de compra, entre ellas un ordenador de marca con SKU exacto y una BOM mixta de ICT / control de acceso. El requerimiento exigía especificaciones exactas en lugar de sustituciones no verificadas.',",
    "      proofAction4: 'Separó los artículos confirmados de los que aún requerían aclaración.',": "      proofAction4: 'Separó los artículos confirmados de los que aún requerían aclaración de especificaciones.',",
    "      proofAction6: 'Preparó una cotización comercial de trabajo para la parte verificable de una BOM mixta.',": "      proofAction6: 'Preparó una cotización comercial para la parte verificable de la BOM mixta.',",
    "      proofAction7: 'Indicó la validez de la cotización, la necesidad de reconfirmar stock, las exclusiones de flete y las limitaciones de garantía.',": "      proofAction7: 'Indicó claramente la validez de la cotización, la necesidad de reconfirmar stock, las exclusiones de flete y las limitaciones de garantía.',",
    "      proofDecision: 'Cuando una referencia exacta del fabricante no pudo confirmarse de forma fiable por los canales normales de suministro, Leano no la sustituyó por un modelo similar presentándolo como equivalente. El artículo permaneció sin resolver hasta reconfirmar la especificación exacta.',": "      proofDecision: 'Cuando una referencia exacta del fabricante no pudo confirmarse de forma fiable por los canales normales de suministro, Leano no la sustituyó por un modelo similar presentándolo como equivalente. El requerimiento permaneció sin resolver a la espera de confirmar la especificación exacta.',",
    "      proofOutcomeLabel: 'Resultado',": "      proofOutcomeLabel: 'Trabajo realizado',",
    "      proofOutcome: 'El trabajo de sourcing y cotización llegó a revisión comercial, pero no se completó ninguna orden de compra, pago ni entrega.',": "      proofOutcome: 'Investigación de rutas de suministro, verificación de especificaciones exactas y preparación de cotización comercial para la parte verificable de la RFQ.',",
}

for old, new in replacements.items():
    # Some no-op localized lines are intentionally omitted from strict replacement.
    if old == new:
        continue
    script = replace_exact(script, old, new, old[:70])

script, removed_notes = re.subn(r'^\s*proofEvidenceNote: .*\n', '', script, flags=re.M)
if removed_notes != 5:
    raise SystemExit(f'expected to remove 5 proofEvidenceNote keys, removed {removed_notes}')
SCRIPT.write_text(script, encoding='utf-8')

proof_test = r'''const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');

const index = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');
const publicSource = `${index}\n${script}\n${styles}`;

test('selected RFQ work is located between process and audience sections', () => {
  const process = index.indexOf('id="process"');
  const proof = index.indexOf('id="selected-rfq-work"');
  const audience = index.indexOf('audience-section');
  assert.ok(process >= 0 && proof > process && audience > proof);
});

test('five-language proof keys and downstream numbering exist', () => {
  for (const key of ['sectionProof', 'proofTitle', 'proofIntro', 'proofOutcomeLabel', 'proofOutcome', 'proofPrinciple4']) {
    assert.equal((script.match(new RegExp(`${key}:`, 'g')) || []).length, 5, `${key} must exist in five locales`);
  }
  assert.equal((script.match(/proofEvidenceNote:/g) || []).length, 0, 'obsolete transaction-disclaimer key must be removed');
  for (const number of ['05 /', '06 /', '07 /']) assert.ok(script.includes(number));
});

test('work-completed copy states only the sourcing and quotation work actually performed', () => {
  const phrases = [
    'Supplier-route research, exact-spec verification and commercial quotation preparation for the verifiable portion of the RFQ.',
    '针对 RFQ 中可核实部分完成供应路径研究、精准规格核验与商业报价准备。',
    'Recherche des routes d’approvisionnement, vérification des spécifications exactes et préparation d’une cotation commerciale pour la partie vérifiable de la RFQ.',
    'Исследование маршрутов поставки, проверка точной спецификации и подготовка коммерческого предложения по проверяемой части RFQ.',
    'Investigación de rutas de suministro, verificación de especificaciones exactas y preparación de cotización comercial para la parte verificable de la RFQ.',
  ];
  for (const phrase of phrases) assert.ok(script.includes(phrase), `missing factual work-completed copy: ${phrase}`);
});

test('public copy does not foreground uncompleted-transaction disclaimers', () => {
  const oldDisclaimers = [
    'does not represent a completed transaction',
    'no purchase order, payment or delivery was completed',
    '不代表已经完成交易',
    '没有完成采购订单、付款或交付',
    'Il ne représente pas une transaction finalisée',
    'aucun bon de commande, paiement ni livraison n’a été finalisé',
    'Он не означает, что сделка была завершена',
    'заказ на покупку, оплата и поставка не были завершены',
    'No representa una transacción completada',
    'no se completó ninguna orden de compra, pago ni entrega',
  ];
  for (const phrase of oldDisclaimers) assert.ok(!publicSource.includes(phrase), `obsolete disclaimer remains public: ${phrase}`);
});

test('private buyer identity, location and forbidden exact SKUs are absent from public source', () => {
  const forbidden = [
    'Julius', 'Equilibrium General Supply', 'Uganda', 'Kampala', 'Cham Towers',
    'C7GG7AT#BH5', 'WD162PURX', 'WeChat', 'scam history'
  ];
  for (const token of forbidden) assert.ok(!publicSource.toLowerCase().includes(token.toLowerCase()), `private token leaked: ${token}`);
});

test('unsupported commercial-success claims are absent from public source', () => {
  const normalized = publicSource.toLowerCase();
  for (const phrase of [
    'successful project', 'client success', 'trusted by', 'completed procurement',
    'we delivered', 'order completed', 'payment received'
  ]) {
    assert.ok(!normalized.includes(phrase), `unsupported success claim: ${phrase}`);
  }
});

test('RFQ production endpoint remains unchanged', () => {
  assert.ok(script.includes("https://script.google.com/macros/s/AKfycbwny2Lu9DvREl_te12o7_KJxhgXUiwTNAEjWkK9zPImF3g7WevC03nyLt5DZLPNseqq/exec"));
});
'''
PROOF_TEST.write_text(proof_test, encoding='utf-8')

search_test = SEARCH_TEST.read_text(encoding='utf-8')
script_hash = hashlib.sha256(SCRIPT.read_bytes()).hexdigest()
body_hash = hashlib.sha256(INDEX.read_text(encoding='utf-8').split('<body>', 1)[1].encode()).hexdigest()
search_test, n1 = re.subn(r"'script\.js': '[0-9a-f]{64}'", f"'script.js': '{script_hash}'", search_test, count=1)
search_test, n2 = re.subn(r"BODY_SHA256 = '[0-9a-f]{64}'", f"BODY_SHA256 = '{body_hash}'", search_test, count=1)
if n1 != 1 or n2 != 1:
    raise SystemExit(f'failed to refresh search baseline: script={n1}, body={n2}')
SEARCH_TEST.write_text(search_test, encoding='utf-8')

print('Revised Selected RFQ Work public copy and evidence-boundary tests.')
