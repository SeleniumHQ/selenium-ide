import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import React from 'react'
import ReactDOM from 'react-dom'
import AlertTitle from '@mui/material/AlertTitle'

function Message(props: any) {
  const { content, duration, type, title }: any = { ...props }
  // 开关控制：默认true,调用时会直接打开
  const [open, setOpen] = React.useState(true)
  // 关闭消息提示
  const handleClose = () => {
    setOpen(false)
  }
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={handleClose}
    >
      <Alert severity={type} variant="filled" sx={{ width: '100%' }}>
        <AlertTitle>{title}</AlertTitle>
        {content}
      </Alert>
    </Snackbar>
  )
}

const message = {
  alertMessage({ content, duration, type, title }: any) {
    // 创建一个dom
    const dom = document.createElement('div')
    // 定义组件，
    const JSXDom = (
      <Message
        content={content}
        duration={duration}
        type={type}
        title={title}
      ></Message>
    )
    // 渲染DOM
    ReactDOM.render(JSXDom, dom)
    // 置入到body节点下
    document.body.appendChild(dom)
  },
}

export default message
