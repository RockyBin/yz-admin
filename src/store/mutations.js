export default {
  saveStoreInfo(state,info){
    state.storeInfo=info;
  },
  saveUserInfo(state,info){
    state.userInfo=info;
  },
  changeBoundState(state,isBound){
    state.isBoundWX=isBound;
  }
};
