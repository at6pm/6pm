import { Text, View } from 'react-native';

import { body } from '../../ui/type/fonts';

/** A small rounded status pill ("On track for Mar", "450k a month", "Ready"). */
export function Pill({
  label,
  bg,
  fg,
  padX,
}: {
  readonly label: string;
  readonly bg: string;
  readonly fg: string;
  readonly padX: number;
}) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        height: 22,
        paddingHorizontal: padX,
        borderRadius: 99,
        backgroundColor: bg,
        justifyContent: 'center',
      }}
    >
      <Text style={{ ...body(11.5, 700), color: fg }}>{label}</Text>
    </View>
  );
}
