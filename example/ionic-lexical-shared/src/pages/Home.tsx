import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import LexicalEditor from '../components/LexicalEditor';
import EditorWrapper from '../components/Editor/Editor';
import EditorWrapperDK from 'lexical-shared-dk'

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tests</IonTitle>
          </IonToolbar>
        </IonHeader>
        <EditorWrapperDK />
      </IonContent>
    </IonPage>
  );
};

export default Home;
