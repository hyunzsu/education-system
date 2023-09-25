/* eslint-disable no-console */
import {
  Title,
  ApiURL,
  Input,
  Result,
  Button,
  DropdownMenu,
  RecordButton,
} from '@/components'
import styles from './DetailForm.module.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  alertAtom,
  detailDataAtom,
  inputValidationAtom,
  loadingAtom,
  isInferAtom,
} from '@/atoms/index'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { DataType } from '@/pages/Detail/Detail'
import addMimeType from '@/utils/addMimeType'
import { default as combinedProcessor } from '@/axios/combinedProcessor'
import { useParams } from 'react-router-dom'
import { convertVideo } from '@/axios'
import axios, { CancelTokenSource } from 'axios'

export type InferObj = {
  label: string | string[]
}

type SelectedFileType = Record<string, string> | null | undefined
export type InputType = string | string[] | null | undefined

interface DetailFormProps {
  data: DataType | null
}

const DetailForm = ({ data }: DetailFormProps) => {
  const [loading, setLoading] = useRecoilState(loadingAtom)
  const { id: pageId } = useParams() as { id: string | undefined }
  const [selected, setSelected] = useState('default')
  const [selectedFile, setSelectedFile] = useState<SelectedFileType>(null)
  const [value, setValue] = useRecoilState(detailDataAtom)
  const [isValid] = useRecoilState(inputValidationAtom)
  const [infer, setInfer] = useState<string | InferObj | string[] | null>(null)
  const [apiURL, setApiURL] = useState<string>('')
  const setAlert = useSetRecoilState(alertAtom)
  const sourceRef = useRef<CancelTokenSource | null>(null)
  const setIsInfer = useSetRecoilState(isInferAtom)

  const [cacheData, setCacheData] = useState<
    Record<string, SelectedFileType | null>
  >({})

  const fileList = data &&
    data['data_list'] && [
      '예제 선택하기',
      ...data['data_list'].map(item => item.name),
    ]

  const isAudio = fileList && pageId === '9'
  if (pageId === '9' && data) {
    data['data_type'] = 'record'
  }

  useEffect(() => {
    setSelected('default')
    setSelectedFile(null)
    setInfer(null)
    setIsInfer(false)
  }, [pageId])

  useEffect(() => {
    if (selected === 'default') {
      setSelectedFile(null)
      setIsInfer(false)

      return
    }
    const target =
      data && data['data_list'].find(item => item.name === selected)
    if (pageId && target) {
      if (pageId === '1202') {
        const mapping = {
          ...target,
          data: Array.isArray(target.data)
            ? target.data.map((item: string) => addMimeType(pageId, item))
            : addMimeType(pageId, target.data as string),
        }
        setSelectedFile(mapping as SelectedFileType)

        return
      }

      if (pageId === '13' || pageId === '1207') {
        if (cacheData[selected]) {
          setSelectedFile(cacheData[selected])

          return
        }

        convertVideo(target.data, setAlert).then(
          (res: Record<string, string> | undefined) => {
            if (!res) return
            const mapping = {
              ...target,
              data: res.convertedVideo,
              original_data: res.originalData,
            }
            setSelectedFile(mapping as SelectedFileType)
            setCacheData(prevCache => ({ ...prevCache, [selected]: mapping }))
          },
        )
      }

      const mapping = { ...target, data: addMimeType(pageId, target.data) }
      setSelectedFile(mapping)
      setIsInfer(false)
    }
  }, [selected, data, pageId, cacheData])

  const onChange = useCallback(
    (selected: string) => {
      if (selected === '예제 선택하기') {
        setSelected('default')
        setSelectedFile(null)
      } else {
        setSelected(selected)
      }
    },
    [selected],
  )

  const onClick = useCallback(async () => {
    sourceRef.current = axios.CancelToken.source()
    if (typeof value === 'string' && value.trim().length === 0) {
      setAlert({ visible: true, option: 'nullError' })

      return
    }
    if (value) {
      const inferResult = await combinedProcessor(
        pageId,
        value,
        apiURL,
        setLoading,
        setAlert,
        sourceRef.current,
      )
      setIsInfer(true)
      setInfer(inferResult === undefined ? null : inferResult)
    } else if (!isValid.isValid) {
      setAlert({ visible: true, option: 'nullError' })
    }
  }, [value, apiURL, setLoading, isValid.isValid, pageId])

  useEffect(() => {
    // 요청을 취소하기 위한 cleanup 함수
    return () => {
      if (sourceRef.current) {
        sourceRef.current.cancel()
      }
    }
  }, [])

  const getInputData = useCallback((data: InputType) => {
    setValue(data as InputType)
  }, [])

  return (
    <section className={styles.container}>
      <Title
        type={2}
        label={'예제 실행해보기'}
        className={'detailform-title'}
      />
      <ApiURL api={data && data.API} apiURL={apiURL} setApiURL={setApiURL} />
      <div className={styles['input-cont']}>
        {data ? (
          <Input
            selected={selectedFile}
            getData={getInputData}
            type={data['data_type']}
          />
        ) : loading ? (
          <div className={styles.loading}>데이터 로딩 중...</div>
        ) : (
          <div className={styles.loading}>데이터 로드에 실패했습니다.</div>
        )}

        <Result infer={infer} />
      </div>
      <div className={styles.fileList}>
        {fileList && <DropdownMenu options={fileList} onSelect={onChange} />}
        {isAudio && <RecordButton />}
      </div>
      <Button
        option={1}
        label={'추론하기'}
        onClick={onClick}
        className={styles['button--input']}
      />
    </section>
  )
}

export default DetailForm
