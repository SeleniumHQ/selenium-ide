import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import TextField from 'browser/components/UncontrolledTextField'
import React, { FC, useContext } from 'react'
import { ProjectShape } from '@seleniumhq/side-api'
import message from './Message'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import { styled } from '@mui/material/styles'
import { context } from 'browser/contexts/session'
import languageMap from 'browser/I18N/keys'
import { FormattedMessage } from 'react-intl'

const CustomButton = styled(Button)({
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100px',
  boxShadow: 'none',
  textTransform: 'none',
  fontSize: 16,
  padding: '6px 12px',
  border: '1px solid',
  lineHeight: 1.5,
  backgroundColor: '#0063cc',
  borderColor: '#0063cc',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#0069d9',
    borderColor: '#0062cc',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#0062cc',
    borderColor: '#005cbf',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
  },
})

const OutPutSettings: FC = () => {
  const { project: outPut } = useContext(context)
  const [options, setOptions] = React.useState([])
  const [host, setHost] = React.useState('http://127.0.0.1:9998')
  const [testPlatform, setTestPlatform] = React.useState(
    'http://9.134.118.97/webUiCase/webUiCase'
  )
  const [page, setPage] = React.useState('')
  const [insertUrl, setInsertUrl] = React.useState(
    '/webui/case/insertCaseByIde'
  )
  const [pageUrl, setPageUrl] = React.useState('/webui/page/allPage')

  // 跳转至测试平台
  const linkTestPlatform = async (url: string) => {
    if (url == '' || url == undefined) {
      message.alertMessage({
        content: (
          <FormattedMessage id={languageMap.outPutConfig.platformError} />
        ),
        duration: 6000,
        type: 'error',
        title: <FormattedMessage id={languageMap.outPutConfig.warn} />,
      })
    } else {
      await window.sideAPI.windows.requestPlaybackWindow(url)
    }
  }
  /**
   * 将录制的用例导入到web项目中
   *
   * @param url 导入的url地址
   * @param project 用例所属项目
   */

  const exportToUi = async (
    project: ProjectShape,
    host: string,
    url: string,
    pageId: any
  ) => {
    if (host === '' || url === '') {
      message.alertMessage({
        content: (
          <FormattedMessage id={languageMap.outPutConfig.checkUrlError} />
        ),
        duration: 6000,
        type: 'error',
        title: <FormattedMessage id={languageMap.outPutConfig.warn} />,
      })
    } else {
      try {
        // 克隆project对象
        let projectBackUp = JSON.parse(JSON.stringify(project))
        // 将项目id置入克隆对象中
        projectBackUp['pageId'] = pageId
        // 创建要发送的数据对象
        const requestData = JSON.stringify(projectBackUp, undefined, 2)
        // 设置请求头部信息
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')

        // 构造请求参数
        const options = {
          method: 'POST',
          body: requestData,
          headers: headers,
        }

        // 发起POST请求并获取响应结果
        const response = await fetch(host + url, options)
        const result = await response.json()
        const code = result.code

        if (code !== null || code !== undefined) {
          if (code === '1000') {
            message.alertMessage({
              content:
                <FormattedMessage id={languageMap.outPutConfig.caseId} /> +
                result.data[0] +
                '!',
              duration: 5000,
              type: 'success',
              title: <FormattedMessage id={languageMap.outPutConfig.success} />,
            })
          } else {
            message.alertMessage({
              content: (
                <FormattedMessage id={languageMap.outPutConfig.failMessage} />
              ),
              duration: 5000,
              type: 'error',
              title: <FormattedMessage id={languageMap.outPutConfig.fail} />,
            })
          }
        }
        return result
      } catch (error) {
        console.error(error)
      }
    }
  }
  const changeUrl = () => {
    /**
     * 根据url地址获取项目列表
     */
    fetch(host + pageUrl)
      .then((response) => response.json())
      .then((data) => {
        setOptions(data.data)
      })
      .catch((error) => {
        setOptions([])
        setPage('')
        console.error(error)
      })
  }

  const checkUrl = () => {
    /**
     * 检查url地址是否正确
     */
    if (host === '' || pageUrl === '') {
      message.alertMessage({
        content: (
          <FormattedMessage
            id={languageMap.outPutConfig.checkBusinessUrlError}
          />
        ),
        duration: 5000,
        type: 'warning',
        title: <FormattedMessage id={languageMap.outPutConfig.warn} />,
      })
    } else {
      changeUrl()
    }
  }

  return (
    <Stack className="p-4" spacing={1}>
      <FormControl>
        <Button
          variant="text"
          onClick={() => {
            linkTestPlatform(testPlatform)
          }}
        >
          {<FormattedMessage id={languageMap.outPutConfig.webLink} />}
        </Button>
      </FormControl>
      <FormControl>
        <TextField
          id="host"
          label={<FormattedMessage id={languageMap.outPutConfig.platformUrl} />}
          name="host"
          helperText={
            <FormattedMessage id={languageMap.outPutConfig.platformUrlHelper} />
          }
          onChange={(e: any) => {
            setTestPlatform(e.target.value)
          }}
          size="small"
          value={testPlatform}
        />
      </FormControl>
      <FormControl>
        <TextField
          id="host"
          label={<FormattedMessage id={languageMap.outPutConfig.serviceHost} />}
          name="host"
          helperText={
            <FormattedMessage id={languageMap.outPutConfig.serviceHostHelper} />
          }
          onBlur={changeUrl}
          onChange={(e: any) => {
            setHost(e.target.value)
          }}
          size="small"
          value={host}
        />
      </FormControl>
      <FormControl>
        <TextField
          id="pageUrl"
          label={
            <FormattedMessage id={languageMap.outPutConfig.businessListUrl} />
          }
          name="pageUrl"
          helperText={
            <FormattedMessage
              id={languageMap.outPutConfig.businessListUrlHelper}
            />
          }
          onBlur={changeUrl}
          onChange={(e: any) => {
            setPageUrl(e.target.value)
          }}
          size="small"
          value={pageUrl}
        />
      </FormControl>
      <FormControl sx={{ m: 1, minWidth: 200 }} size="small" onFocus={checkUrl}>
        <InputLabel id="select-helper-label">
          {<FormattedMessage id={languageMap.outPutConfig.caseInBusiness} />}
        </InputLabel>
        <Select
          labelId="setProject-label"
          id="page"
          value={page}
          label="page"
          onChange={(e: any) => {
            setPage(e.target.value)
          }}
        >
          {options.map((option: any) => (
            <MenuItem key={option.id} value={option.id}>
              {option.pageName}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {
            <FormattedMessage
              id={languageMap.outPutConfig.caseInBusinessHelper}
            />
          }
        </FormHelperText>
      </FormControl>
      <FormControl>
        <TextField
          id="insertUrl"
          label={<FormattedMessage id={languageMap.outPutConfig.exportUrl} />}
          name="insertUrl"
          helperText={
            <FormattedMessage id={languageMap.outPutConfig.exportUrlHelper} />
          }
          onChange={(e: any) => {
            setInsertUrl(e.target.value)
          }}
          size="small"
          value={insertUrl}
        />
      </FormControl>
      <FormControl>
        <CustomButton
          variant="contained"
          size="small"
          onClick={() => {
            exportToUi(outPut, host, insertUrl, page)
          }}
        >
          {<FormattedMessage id={languageMap.outPutConfig.exportBtn} />}
        </CustomButton>
      </FormControl>
    </Stack>
  )
}

export default OutPutSettings
