export const createJsonMsg = (type: string, data: object) => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  });
};

export const createJsonMsgData = (type: string, msgData: any, attackData?) => {
  switch (type) {
    case 'turn':
      return JSON.stringify({
        type,
        data: JSON.stringify({
          currentPlayer: msgData.indexPlayer,
        }),
        id: 0,
      });

    case 'attack':
      return JSON.stringify({
        type,
        data: JSON.stringify({
          position: {
            x: attackData?.x,
            y: attackData?.y,
          },
          currentPlayer: msgData.indexPlayer,
          status: attackData?.status,
        }),
        id: 0,
      });

    case 'finish':
      return JSON.stringify({
        type,
        data: JSON.stringify({
          winPlayer: msgData.indexPlayer,
        }),
        id: 0,
      });

    default:
      return JSON.stringify({
        type,
        data: JSON.stringify(msgData),
        id: 0,
      });
  }
};
