import { useLocalSearchParams } from 'expo-router';

import { JarPage } from '../../features/pots/jar-page';

/** A jar's page: a full page over the sky, the jar grown out of the one tapped. */
export default function Pot() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <JarPage id={id ?? ''} />;
}
