/* 영화 리뷰 텍스트 감정 분석 - 텍스트 분류 */
/* 이 예제에서 사용자는 text 파일을 선택하거나, 직접 입력할 수 있다 */

import axios from 'axios'

const textClassification = (
  value: any, // 사용자가 입력한 값 (text or base64)
  formUrl: any, // 사용자가 입력한 api Url
  setLoading: any, // 로딩
  // setResult: any,    // 결과 컴포넌트
) => {
  const axiosUrl = '/inference/text_req_ajx' // 고정값
  /* FormData (apiUrl, data) 형태로 전송 */
  const formData = new FormData()
  formData.append('url', formUrl)
  formData.append('word', value) // 사용자가 전송할 값이 [문자열] 형태일 때
  //  formData.append("file", value);   // 사용자가 전송할 값이 [파일] 형태일 때
  let resultData = ''
  setLoading(true) // 로딩 표시

  /* axios 비동기 통신 함수 */
  axios
    .post(axiosUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'json',
    })
    .then(res => {
      /* response_data에 결과값 반환 */
      let json = res.data
      if (json.res == 'true') {
        let response_data = json.response.data
        if (response_data == null) {
          response_data = json.response.inference
        }
        /* 결과값에 따라 결과 컴포넌트 렌더링 */
        if (response_data == 'pos') {
          resultData = '긍정'
          // 긍정 결과 컴포넌트
        } else {
          resultData = '부정'
          // 부정 결과 컴포넌트
        }
      } else {
        alert('API 호출에 실패했습니다.')
      }
    })
    .catch(err => {
      console.log(err.message)
    })
    .finally(() => {
      setLoading(false)
    })
  return { label: resultData }
}

export default textClassification
