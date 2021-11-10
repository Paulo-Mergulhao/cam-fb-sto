import * as ImagePicker from "expo-image-picker";
import { getApps, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import React from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  LogBox,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import uuid from "uuid";

const firebaseConfig = {
    apiKey: "AIzaSyD1Li4OldR_Ux2h01WVqAkunLGt9Epxaq8",
    authDomain: "fir-pdm202102-78c85.firebaseapp.com",
    databaseURL: "https://fir-pdm202102-78c85-default-rtdb.firebaseio.com",
    projectId: "fir-pdm202102-78c85",
    storageBucket: "fir-pdm202102-78c85.appspot.com",
    messagingSenderId: "719981721841",
    appId: "1:719981721841:web:1210cc527741bc98459150"
};


if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// desligar avisos do Firebase sobre longos per[iodos de resposta
LogBox.ignoreLogs([`Setting a timer for a long period`]);

export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
  };

  async componentDidMount() {
    if (Platform.OS !== "web") {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Desculpe! Precisamos de permissões para uso da câmera!");
      }
    }
  }

  render() {
    let { image: image } = this.state;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {!!image && (
          <Text
            style={{
              fontSize: 20,
              marginBottom: 20,
              textAlign: "center",
              marginHorizontal: 15,
            }}
          >
            Resultado do ImagePicker
          </Text>
        )}

        
        <Button
          style={{
            marginBottom: 20,
            marginHorizontal: 15,
          }}
          onPress={this._pegaImagem}
          title="Pegar uma imagem do celular"
        />
        
        <Button 
          tyle={{
            marginBottom: 20,
            marginHorizontal: 15,
          }}
          onPress={this._tiraFoto} title="Tirar uma foto" />
        
        {this._talvezRenderizaImagem()}
        {this._talvezRenderizaUpload()}

        <StatusBar barStyle="default" />
      </View>
    );
  }

  _talvezRenderizaUpload = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _talvezRenderizaImagem = () => {
    let { image: image } = this.state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 30,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: "hidden",
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
        <Text
          onPress={this._copiaparaClipboard}
          onLongPress={this._compartilha}
          style={{ paddingVertical: 10, paddingHorizontal: 10 }}
        >
          {image}
        </Text>
      </View>
    );
  };

  _compartilha = () => {
    Share.share({
      message: this.state.image,
      title: "Faz Check Out desta foto",
      url: this.state.image,
    });
  };

  _copiaparaClipboard = () => {
    Clipboard.setString(this.state.image);
    alert("Imagem copiada para a área de transferência");
  };

  _tiraFoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    this._trataImagem(pickerResult);
  };

  _pegaImagem = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log({ pickerResult });

    this._trataImagem(pickerResult);
  };

  _trataImagem = async (pickerResult) => {
    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {
        const uploadUrl = await uploadImagemAsync(pickerResult.uri);
        this.setState({ image: uploadUrl });
      }
    } catch (e) {
      console.log(e);
      alert("Falha no upload!");
    } finally {
      this.setState({ uploading: false });
    }
  };
}

async function uploadImagemAsync(uri) {
  
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const fileRef = ref(getStorage(), uuid.v4());
  const result = await uploadBytes(fileRef, blob);

  blob.close();

  return await getDownloadURL(fileRef);
}