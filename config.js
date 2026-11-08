/**
 * サイトの設定
 * URL・日時・受付状況を変更するときは、このファイルだけを編集します。
 */
window.SITE_CONFIG = Object.freeze({
  briefingFormUrl: "https://forms.gle/2EQ8CP29ruA14btT6",
  courseFormUrl: "https://forms.gle/PEAife2aR15JxKDB8",
  questionFormUrl: "https://forms.gle/HSmRaCTw8Fk2rgXU9",
  qaCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRm8c8vD-nKENgPTH-WhkTBby4Ilq_jdzX5PPwaYT-YNjMeyoJsYKdyj31FaPiBPbuV0pSP9cWA-Abi/pub?output=csv",

  courseSchedule: {
    first: "2026年12月12日（土）9:45〜10:45",
    second: "2027年1月23日（土）9:45〜12:00"
  },
  briefingDateTime: "2026年11月19日（木）15:30〜16:30",
  venue: "稽古館",
  applicationDeadline: "申込フォームをご確認ください",

  briefingRegistrationOpen: true,
  courseApplicationOpen: true
});
