import React, { FC, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Separator, Spinner, Text, View } from 'tamagui'
import { BarChart } from 'react-native-gifted-charts'
import { router, useLocalSearchParams } from 'expo-router'
import dayjs from 'dayjs'

import BackButton from '@/components/back-button'
import { FontSizes } from '@/utils/fonts'
import { hp, wp } from '@/utils/responsive'
import Card from '@/components/card'
import { THEME_COLORS } from '@/utils/theme'
import DatePicker from '@/components/date-picker'
import { useGetGoalDetails, useGetGoalTimeline } from '@/queries/goal'
import { getGoalTimelineData } from '@/utils/goal'

interface IKeyValueTextProps {
  title: string
  value: string
}

const KeyValueText: FC<IKeyValueTextProps> = ({ title = '', value = '' }) => {
  return (
    <Text fontSize={FontSizes.size16}>
      {' '}
      <Text fontSize={FontSizes.size18} fontFamily={'$body'} fontWeight={'bold'}>
        {title}:
      </Text>{' '}
      {value}
    </Text>
  )
}

const GoalDetails = () => {
  const insets = useSafeAreaInsets()

  const [fromDate, setFromDate] = useState<Date | undefined>(dayjs().subtract(6, 'day').toDate())
  const [toDate, setToDate] = useState<Date | undefined>(dayjs().toDate())
  const params = useLocalSearchParams()

  const { data: goalDetailsQueryData } = useGetGoalDetails(+params?.id)
  const {
    data: goalTimelineQueryData,
    error: timelineError,
    isLoading: isLoadingTimelineData,
  } = useGetGoalTimeline(+params?.id)

  const goalData = goalDetailsQueryData?.data || null

  const barData = useMemo(
    () => getGoalTimelineData(goalTimelineQueryData?.data, fromDate, toDate),
    [fromDate, goalTimelineQueryData, toDate],
  )

  return (
    <View f={1} pt={insets.top + hp(2)} bg="$backgroundHover">
      <View fd="row" ai="center" columnGap={wp(4)} mx={wp(5)}>
        <BackButton onPress={() => router.push('/(authenticated)/goals')} />
        <Text fontSize={FontSizes.size20} fontFamily={'$heading'}>
          {goalData?.name}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: hp(2) }}>
        <Card mt={hp(3)}>
          <Text fontSize={FontSizes.size20} fontWeight={'bold'}>
            Details
          </Text>
          <Separator my={hp(1.5)} borderColor={THEME_COLORS.gray[200]} />
          <View rowGap={hp(2)}>
            <KeyValueText title="Target" value={goalData?.target_value} />
            <KeyValueText title="Source" value={goalData?.target_contribution_source} />
            <KeyValueText title="KPI" value={goalData?.track_kpi} />
            <KeyValueText title="Reachable by" value={`${Math.abs(goalData?.reachable_by_days)} Days`} />
            <KeyValueText title="Proportionality" value={goalData?.goal_proportionality} />
          </View>
        </Card>
        <Card mt={hp(3)}>
          <Text fontSize={FontSizes.size20} fontWeight={'bold'}>
            Timeline
          </Text>
          <Separator my={hp(1.5)} borderColor={THEME_COLORS.gray[200]} />

          {isLoadingTimelineData && (
            <View f={1} py={hp(2)} ai="center">
              <Spinner size="large" color={THEME_COLORS.primary[100]} />
              <Text mt={hp(1.5)} fontFamily={'$heading'} fontSize={FontSizes.size18}>
                Loading Timeline...
              </Text>
            </View>
          )}

          {!!timelineError && (
            <View f={1} py={hp(2)} ai="center">
              <Text fontFamily={'$heading'} fontSize={FontSizes.size18}>
                Failed to load timeline data
              </Text>
            </View>
          )}

          {!!barData.length && !timelineError && (
            <>
              <View fd="row" ai="center" columnGap={wp(6)} mb={hp(2)}>
                <View rowGap={hp(1)} f={1}>
                  <Text fontSize={FontSizes.size16} fontWeight={'bold'}>
                    From :-
                  </Text>
                  <DatePicker value={fromDate} onChange={setFromDate} maximumDate={toDate} />
                </View>
                <View rowGap={hp(1)} f={1}>
                  <Text fontSize={FontSizes.size16} fontWeight={'bold'}>
                    To :-
                  </Text>
                  <DatePicker value={toDate} onChange={setToDate} minimumDate={fromDate} />
                </View>
              </View>
              <BarChart
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
              />
            </>
          )}
        </Card>
      </ScrollView>
    </View>
  )
}

export default GoalDetails
