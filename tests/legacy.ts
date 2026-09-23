/** Slova ze staré verze aplikace (WORDS + SKLADANI_WORDS) – všechna musí v nové bance zůstat. */
export const LEGACY_WORDS = `pes les nos dům had med led lev sob sůl míč rak mák sýr auto kolo voda hora ryba žába sova koza mrak drak
vlak pták sníh klíč dort myš orel osel tygr bobr hrad most kost máma táta kočka liška myška škola kniha tráva kráva strom vítr
hruška jelen komín lampa lopata zámek hřeben polštář koláč párek slepice slunce srdce hvězda jablko medvěd zajíc květina motýl
ptáček králík pavouk jahoda banán brambora čokoláda zmrzlina ponožka batoh letadlo divadlo počítač dinosaurus tramvaj kolotoč
houpačka žirafa velryba veverka sluníčko srdíčko perníček třešně ježek tunel robot raketa planeta ovce kozel moucha komár brouk
mravenec beruška lachtan plameňák kachna holub vrabec labuť datel hroch rohlík knedlík řízek hranolky palačinka špenát guláš
limonáda marmeláda šlehačka peřina koberec sporák vysavač žehlička zrcadlo budík zásuvka potok jezero kopec jeskyně vodopád
oceán sopka svetr rukavice šála kalhoty mikina bunda motorka helikoptéra koloběžka buldozer klouzačka pískoviště prolézačka
dalekohled fotoaparát hodiny nůžky brusle pastelka penál krtek kobyla sysel tchoř losos sumec čáp vrána havran bažant koroptev
špaček vlaštovka žralok velbloud hroznýš zelí salát těstoviny buchta chléb jogurt pudink tvaroh meloun okurka paprika cibule
malina borůvka višeň skála louka ostrov pramen ledovec údolí poušť kostel věž maják studna palác brána fontána meč štít poklad
koruna trůn kladivo pilka šroubovák hrábě kolečko kytara bubny housle flétna trubka píšťalka pravítko kružítko sešit tabule
ves balón`
  .split(/\s+/)
  .filter(Boolean)
  .concat(['mořský koník']);

/** Slova, která se v aplikaci pro děti nesmí nikdy objevit. */
export const FORBIDDEN = ['kokot', 'prdel', 'hovno', 'kurva', 'píča', 'debil', 'blbec', 'kráva blbá', 'sráč', 'ďábel'];
