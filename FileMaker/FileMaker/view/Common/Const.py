
#
#
# Constants

class REST_API:
    #
    CMD_GET  = '1000'   # 参照コマンド
    CMD_POST = '0100'   # 更新コマンド
    CMD_PUT  = '0010'   # 登録コマンド
    CMD_DEL  = '0001'   # 削除コマンド
    # 以下操作権
    CMD_FULL = '1111'   # 全操作
    CMD_ALL  = '1100'   # 参照・更新
    CMD_APD  = '1110'   # 参照・更新・登録
    CMD_MOD  = '0110'   # 更新・登録
    CMD_MASK = 0b1111

class LOG_MODE:
    #
    LOG_WEB = 'LogWeb'
    LOG_BATCH = 'LogBatch'