# References
# Browser codec compatibility https://gist.github.com/Vestride/278e13915894821e1d6f
# Youtube Streaming best pratices https://support.google.com/youtube/answer/2853702?hl=pt 

# Search by
# MP4 fragment and segments

ASSETSFOLDER=assets/timeline

for mediaFile in `ls $ASSETSFOLDER | grep .mp4`; do
  # cortar extensão e resolução do nome do video
  FILENAME=$(echo $mediaFile | sed -n 's/.mp4//p' | sed -n 's/-1920x1080//p')
  INPUT=$ASSETSFOLDER/$mediaFile

  # cria uma pasta com nome de cada arquivo
  FOLDER_TARGET=$ASSETSFOLDER/$FILENAME
  mkdir -p $FOLDER_TARGET

  # criar arquivo de resolução diferente na past
  OUTPUT=$ASSETSFOLDER/$FILENAME/$FILENAME
  DURATION=$(ffprobe -i $INPUT -show_format -v quiet | sed -n 's/duration=//p')

  OUTPUT144=$OUTPUT-$DURATION-144
  OUTPUT360=$OUTPUT-$DURATION-360
  OUTPUT720=$OUTPUT-$DURATION-720

  echo 'rendering in 720p'
  ffmpeg -y -i $INPUT \
    -c:a aac -ac 2 \
    -vcodec h264 -acodec aac \
    -ab 128k \
    -movflags frag_keyframe+empty_moov+default_base_moof \
    -b:v 1500k \
    -maxrate 1500k \
    -bufsize 1000k \
    -vf "scale=-1:720" \
    $OUTPUT720.mp4
    # -v quiet \ 

done