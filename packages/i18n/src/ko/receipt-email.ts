import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

// {provider} is a mail service's name (Gmail, Outlook) and {address} an email address; both are
// followed by a noun or a colon, never a particle.
export const koReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': '주소 복사',
  'receiptEmail.share': '내 6pm 주소 공유',
  'receiptEmail.offline': '온라인이 되면 주소가 보여요',
  'receiptEmail.from': '보낸 곳: {address}',
  'receiptEmail.deviceMode': 'AI를 이 iPhone에서만 쓰는 동안 꺼짐',
  'receiptEmail.deviceMode.body':
    '영수증 이메일은 저희 서버가 메일을 읽어야 해서, 6pm이 AI를 이 iPhone에서만 쓰는 동안은 꺼져 있어요. 대신 영수증을 공유하거나 스캔하세요.',
  'receiptEmail.check.title': '{provider} 메일에서 {address} 주소의 전달 확인을 요청해요',
  'receiptEmail.check.titleNoAddress': '{provider} 메일에서 6pm으로의 전달 확인을 요청해요',
  'receiptEmail.check.code': '확인 코드',
  'receiptEmail.check.copy': '복사',
  'receiptEmail.check.copyLabel': '확인 코드 복사',
  'receiptEmail.check.copied': '코드를 복사했어요.',
  'receiptEmail.check.hint':
    '확인 페이지를 열거나, {provider} 설정에 코드를 붙여넣으세요. 그러면 전달된 영수증이 여기로 들어와요.',
  'receiptEmail.check.open': '확인 페이지 열기',
  'receiptEmail.check.openFailed': '페이지를 열지 못했어요. 대신 코드를 복사하세요.',
  'receiptEmail.check.hintNoCode':
    '확인 페이지를 열고 확인을 탭하세요. 그러면 전달된 영수증이 여기로 들어와요.',
  'receiptEmail.check.openFailedNoCode': '페이지를 열지 못했어요. 잠시 후 다시 시도하세요.',
  'receiptEmail.check.done': '완료',
};
