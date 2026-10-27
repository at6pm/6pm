import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// {when} is one of the backup.ago lines (방금, 3분 전), so it reads before a verb. The keychain is
// "iCloud 키체인", as the Korean iPhone names it.
export const koBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': '백업',
  'backup.row.off': '끔',
  'backup.row.on': 'iCloud · {when}',
  'backup.row.found': '백업 발견',
  'backup.row.deleting': '삭제 중…',
  'backup.ago.now': '방금',
  'backup.ago.minutes': { other: '{count}분 전' },
  'backup.ago.hours': { other: '{count}시간 전' },
  'backup.ago.days': { other: '{count}일 전' },

  'backup.status.on': '{when} 백업했어요.',
  'backup.status.sub': {
    other: 'iCloud · {count}개 항목 · 암호화됨. 백업 없이도 6pm은 잘 돌아가요.',
  },
  'backup.status.never': '준비되면 시작하세요.',
  'backup.status.neverSub': 'iCloud · 암호화됨. 백업 없이도 6pm은 잘 돌아가요.',
  'backup.off.title': '모든 하루를, 영원히.',
  'backup.off.sub':
    '이 iPhone을 떠나기 전에 암호화돼요. 키는 내 iCloud 키체인에만 있어서 저희는 아무것도 읽을 수 없어요.',
  'backup.tooLarge':
    '지난 백업은 너무 커서 보내지 못했어요. 모든 기록은 이 iPhone에 그대로 있어요.',
  'backup.note':
    '하루에 한 번, 마감한 뒤에 백업해요. 새 iPhone에서 복원하려면 iOS 설정에서 iCloud 키체인을 켜 주세요.',
  'backup.paused': 'Max가 없어서 백업이 멈췄어요. 마지막 백업은 iCloud에 안전하게 있어요.',
  'backup.empty': '아직 백업할 게 없어요. 첫 하루를 마감하고 다시 오세요.',

  'backup.turnOn': '백업 켜기',
  'backup.now': '지금 백업',
  'backup.working': '백업 중…',
  'backup.delete': '백업 삭제',
  'backup.deleteConfirm': '한 번 더 탭하면 백업이 삭제돼요',
  'backup.deleting': '삭제 중…',
  'backup.deletePending':
    '6pm이 온라인이 되면 바로 백업이 삭제돼요. 그동안은 아무것도 보내지 않아요.',

  'backup.found.title': 'iCloud에 이미 백업이 있어요.',
  'backup.found.sub':
    '다른 iPhone이나 이전 설치에서 만든 백업이에요. 여기서 백업하면 그 백업을 덮어써요.',
  'backup.found.restore': '여기로 복원',
  'backup.found.restoreConfirm': '한 번 더 탭하면 이 iPhone의 기록을 덮어써요',
  'backup.found.replace': '이 iPhone 기록으로 덮어쓰기',

  'backup.restore.link': '백업에서 복원',
  'backup.restore.title': '백업에서 복원',
  'backup.restore.found': '{date} 백업을 찾았어요.',
  'backup.restore.sub': { other: '{count}개 항목 · iCloud에 암호화됨.' },
  'backup.restore.do': '내 기록 복원',
  'backup.restore.working': '복원 중…',
  'backup.restore.fresh': '새로 시작하기',
  'backup.restore.freshNote': '새로 시작해도 백업은 남아 있다가, 처음 새로 백업할 때 교체돼요.',
  'backup.restore.looking': '백업을 찾는 중…',
  'backup.restore.none': '이 iCloud 키체인에서 백업을 찾지 못했어요.',
  'backup.restore.unsupported':
    '더 새로운 버전의 6pm으로 만든 백업이에요. 앱을 업데이트한 뒤 복원하세요.',
  'backup.restore.wrongKey': '이 iPhone에 있는 키로는 이 백업을 열 수 없어요.',
  'backup.restore.damaged': '손상된 백업이라 복원할 수 없어요.',

  'backup.error.network': '6pm에 연결하지 못했어요. 잠시 후 다시 시도하세요.',
  'backup.error.keychain':
    'iCloud 키체인에 키를 저장하지 못해서 백업하지 않았어요. iOS 설정에서 켜져 있는지 확인하세요.',
  'backup.error.tooLarge':
    '백업이 너무 커서 보낼 수 없어요. 모든 기록은 이 iPhone에 그대로 있어요.',
  'backup.retry': '다시 시도',
  'backup.error.generic': '잘 안 됐어요. 다시 시도하세요.',

  'backup.toast.deleted': '백업을 삭제했어요.',
  'companion.backupDone.soft': '백업 완료. 하루하루가 안전하게 담겼어요.',
  'companion.backupDone.cheeky': '백업 완료. 최악의 화요일까지 이제 안전해.',
  'companion.backupDone.roast': '백업 완료. 네 흑역사도 이제 클라우드에 영원히.',
  'companion.backupDone.plain': '백업을 완료했어요.',
  'companion.backupRestored.soft': '다시 와 줘서 반가워요. 전부 그대로 있어요.',
  'companion.backupRestored.cheeky': '클라우드에서 귀환. 빠진 거 하나 없어.',
  'companion.backupRestored.roast': '복원 완료. 폰은 이제 그만 잃어버리자.',
  'companion.backupRestored.plain': '백업을 복원했어요.',
};
