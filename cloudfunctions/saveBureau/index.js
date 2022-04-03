// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event) => {
  let data = {
    msg: 'error'
  }
  switch (event.type) {
    case "addCard":
      data = await addCard(event); // 
      break;
    case "readCard":
      data = await readCard(event); // 
      break;
    case "bureauMember":
      data = await bureauMember(event); // 
      break;
    case "writeComment":
      data = await writeComment(event); // 
      break;
    case "delComment":
      data = await delComment(event); // 
      break;
    
      


  }
  return data
}
async function addCard(event) {
  if (event.addData) {
    try {
      return await db.collection('saveBureau').add({
        data: {
          text:event.addData.text,
          label:event.addData.label,
          photo:event.addData.photo,
          locationName:event.addData.locationName,
          womanNum:event.addData.womanNum,
          manNum:event.addData.manNum,
          time: event.addData.time,
          userName:event.addData.userName,
          iconUrl:event.addData.iconUrl,
          nickName:event.addData.nickName,
          school:event.addData.school,
          commentList:event.addData.commentList
        }
      })
    } catch (e) {
      console.error(e);
    }
  }
}
async function readCard(event) {
  var page=event.currentPage * 10;
  var temp = {
    school: event.school
  }
  if(event.label!=null){
    temp={
      'school': event.school,
      'label': event.label
    }
  }
  console.log("temp",temp);
  // event.label != null ? temp["label"] = event.label : '';
  try {
    return await db.collection('saveBureau').orderBy('indexFront', 'desc').orderBy('SortTime', 'desc').orderBy('Time', 'desc').where(temp).skip(page).limit(15).get();
  } catch (e) {
    console.error(e);
  }
}
async function bureauMember(event) {
  try{
    await db.collection('saveBureau').where({
      _id: event._id
    })
    .update({
      data:{
        manNum:event.manNum,
        womanNum:event.womanNum
      },
    })
  }catch(e){
    console.error(e);
  }
}

async function writeComment(event) {
  try{
    await db.collection('saveBureau').where({
      _id: event._id
    })
    .update({
      data:{
        commentList: _.push(event.addData)
      },
    })
  }catch(e){
    console.error(e);
  }
}

async function delComment(event, type, content) {
  if (event.delData) {

   await db.collection('saveBureau').where({
      _id: event._id
    }).update({
      data: {
        commentList: _.pull({
          iconUrl : _.eq(event.delData.iconUrl),
          userName : _.eq(event.delData.userName),
          nickName : _.eq(event.delData.nickName),
          time : _.eq(event.delData.time),
          reply : _.eq(event.delData.reply),
          input : _.eq(event.delData.input),
        })
      }
    })
    data = {
      msg: 'success'
    }
    return data
  }


}
