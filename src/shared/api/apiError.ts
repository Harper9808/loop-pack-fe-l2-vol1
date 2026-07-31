// 상태 코드를 message 문자열에 섞지 않고 별도 필드로 보존한다.
// 문자열에 넣으면 쓰는 쪽(재시도 판단 등)이 메시지를 다시 파싱해야 한다.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
